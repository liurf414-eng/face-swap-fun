// Email Authentication API with magic link
import { kv } from '@vercel/kv';
import crypto from 'crypto';

const TOKEN_EXPIRY = 15 * 60; // 15 minutes for magic link
const SESSION_EXPIRY = 30 * 24 * 60 * 60; // 30 days for session

// Generate random token
function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

// Generate 6-digit verification code
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send magic link email (using a simple fetch to email service)
async function sendMagicLinkEmail(email, code, magicLink) {
  // For production, integrate with SendGrid, Resend, or similar
  // For now, we'll use a simple console log for development
  console.log(`[AUTH] Magic link for ${email}: ${magicLink}`);
  console.log(`[AUTH] Verification code for ${email}: ${code}`);

  // Example integration with Resend (uncomment when API key is available)
  /*
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (RESEND_API_KEY) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'FaceAI Hub <noreply@faceaihub.com>',
        to: email,
        subject: 'Sign in to FaceAI Hub',
        html: `
          <h2>Sign in to FaceAI Hub</h2>
          <p>Click the link below to sign in:</p>
          <a href="${magicLink}" style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px;">Sign In</a>
          <p>Or enter this code: <strong>${code}</strong></p>
          <p>This link expires in 15 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `
      })
    });
  }
  */

  return true;
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { action } = req.query;

    // POST /api/auth?action=sendCode - Send magic link/code to email
    if (req.method === 'POST' && action === 'sendCode') {
      const { email } = req.body;

      if (!email || !email.includes('@')) {
        return res.status(400).json({
          success: false,
          error: 'Valid email required'
        });
      }

      const normalizedEmail = email.toLowerCase().trim();
      const code = generateCode();
      const token = generateToken();

      // Store verification data
      const verifyKey = `verify:${normalizedEmail}`;
      await kv.hset(verifyKey, {
        code,
        token,
        email: normalizedEmail,
        createdAt: Date.now()
      });
      await kv.expire(verifyKey, TOKEN_EXPIRY);

      // Generate magic link
      const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:5173';
      const magicLink = `${baseUrl}/auth/verify?token=${token}&email=${encodeURIComponent(normalizedEmail)}`;

      // Send email
      await sendMagicLinkEmail(normalizedEmail, code, magicLink);

      return res.status(200).json({
        success: true,
        message: 'Verification code sent',
        // In development, return code for testing
        ...(process.env.NODE_ENV !== 'production' && { code, magicLink })
      });
    }

    // POST /api/auth?action=verifyCode - Verify code and create session
    if (req.method === 'POST' && action === 'verifyCode') {
      const { email, code } = req.body;

      if (!email || !code) {
        return res.status(400).json({
          success: false,
          error: 'Email and code required'
        });
      }

      const normalizedEmail = email.toLowerCase().trim();
      const verifyKey = `verify:${normalizedEmail}`;
      const verifyData = await kv.hgetall(verifyKey);

      if (!verifyData || verifyData.code !== code) {
        return res.status(400).json({
          success: false,
          error: 'Invalid or expired code'
        });
      }

      // Code is valid - create or get user
      let userId = await kv.get(`email:${normalizedEmail}`);

      if (!userId) {
        // Create new user
        userId = `user_${generateToken(16)}`;
        await kv.set(`email:${normalizedEmail}`, userId);

        // Initialize user data
        const userKey = `user:${userId}`;
        await kv.hset(userKey, {
          id: userId,
          email: normalizedEmail,
          dailyCredits: 200,
          bonusCredits: 0,
          lastResetDate: new Date().toISOString().split('T')[0],
          totalUsed: 0,
          tier: 'free',
          createdAt: new Date().toISOString()
        });
      }

      // Create session
      const sessionToken = generateToken();
      const sessionKey = `session:${sessionToken}`;
      await kv.hset(sessionKey, {
        userId,
        email: normalizedEmail,
        createdAt: Date.now()
      });
      await kv.expire(sessionKey, SESSION_EXPIRY);

      // Clean up verification data
      await kv.del(verifyKey);

      return res.status(200).json({
        success: true,
        data: {
          userId,
          email: normalizedEmail,
          sessionToken
        }
      });
    }

    // POST /api/auth?action=verifyToken - Verify magic link token
    if (req.method === 'POST' && action === 'verifyToken') {
      const { email, token } = req.body;

      if (!email || !token) {
        return res.status(400).json({
          success: false,
          error: 'Email and token required'
        });
      }

      const normalizedEmail = email.toLowerCase().trim();
      const verifyKey = `verify:${normalizedEmail}`;
      const verifyData = await kv.hgetall(verifyKey);

      if (!verifyData || verifyData.token !== token) {
        return res.status(400).json({
          success: false,
          error: 'Invalid or expired link'
        });
      }

      // Token is valid - create or get user
      let userId = await kv.get(`email:${normalizedEmail}`);

      if (!userId) {
        userId = `user_${generateToken(16)}`;
        await kv.set(`email:${normalizedEmail}`, userId);

        const userKey = `user:${userId}`;
        await kv.hset(userKey, {
          id: userId,
          email: normalizedEmail,
          dailyCredits: 200,
          bonusCredits: 0,
          lastResetDate: new Date().toISOString().split('T')[0],
          totalUsed: 0,
          tier: 'free',
          createdAt: new Date().toISOString()
        });
      }

      // Create session
      const sessionToken = generateToken();
      const sessionKey = `session:${sessionToken}`;
      await kv.hset(sessionKey, {
        userId,
        email: normalizedEmail,
        createdAt: Date.now()
      });
      await kv.expire(sessionKey, SESSION_EXPIRY);

      // Clean up
      await kv.del(verifyKey);

      return res.status(200).json({
        success: true,
        data: {
          userId,
          email: normalizedEmail,
          sessionToken
        }
      });
    }

    // GET /api/auth?action=session - Validate session and get user info
    if (req.method === 'GET' && action === 'session') {
      const authHeader = req.headers.authorization;
      const sessionToken = authHeader?.replace('Bearer ', '');

      if (!sessionToken) {
        return res.status(401).json({
          success: false,
          error: 'No session token'
        });
      }

      const sessionKey = `session:${sessionToken}`;
      const session = await kv.hgetall(sessionKey);

      if (!session) {
        return res.status(401).json({
          success: false,
          error: 'Invalid or expired session'
        });
      }

      // Get user data
      const userKey = `user:${session.userId}`;
      const user = await kv.hgetall(userKey);

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          userId: session.userId,
          email: session.email,
          dailyCredits: user.dailyCredits,
          bonusCredits: user.bonusCredits || 0,
          tier: user.tier || 'free'
        }
      });
    }

    // POST /api/auth?action=logout - Invalidate session
    if (req.method === 'POST' && action === 'logout') {
      const authHeader = req.headers.authorization;
      const sessionToken = authHeader?.replace('Bearer ', '');

      if (sessionToken) {
        await kv.del(`session:${sessionToken}`);
      }

      return res.status(200).json({
        success: true,
        message: 'Logged out'
      });
    }

    return res.status(400).json({
      success: false,
      error: 'Invalid action'
    });

  } catch (error) {
    console.error('Auth API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
