// Credits API - Manages user credits with Vercel KV
import { kv } from '@vercel/kv';

const DAILY_FREE_CREDITS = 100;
const INITIAL_BONUS_CREDITS = 100; // 新用户初始赠送

// Credit costs per action
const CREDIT_COSTS = {
  'face-swap': { costPerSecond: 10, type: 'video' },
  'text-to-image': { costPerImage: 5, type: 'image' },
  'text-to-video': { costPerSecond: 10, type: 'video' },
  'image-to-video': { costPerSecond: 10, type: 'video' }
};

function calculateCost(action, params = {}) {
  const rule = CREDIT_COSTS[action];
  if (!rule) return 0;

  if (rule.type === 'video') {
    return Math.ceil(params.duration || 0) * rule.costPerSecond;
  }
  if (rule.type === 'image') {
    return (params.count || 1) * rule.costPerImage;
  }
  return 0;
}

function getTodayUTC() {
  return new Date().toISOString().split('T')[0];
}

// Get or create user data
async function getOrCreateUser(userId) {
  const userKey = `user:${userId}`;
  let user = await kv.hgetall(userKey);

  const today = getTodayUTC();

  if (!user) {
    // Create new user with initial bonus credits
    user = {
      id: userId,
      dailyCredits: DAILY_FREE_CREDITS,
      bonusCredits: INITIAL_BONUS_CREDITS,
      lastResetDate: today,
      totalUsed: 0,
      tier: 'free',
      subscriptionPlan: 'free',
      createdAt: new Date().toISOString()
    };
    await kv.hset(userKey, user);
  } else if (user.lastResetDate !== today) {
    // Reset daily credits for new day
    user.dailyCredits = DAILY_FREE_CREDITS;
    user.lastResetDate = today;
    await kv.hset(userKey, {
      dailyCredits: DAILY_FREE_CREDITS,
      lastResetDate: today
    });
  }

  return user;
}

// Log credit transaction
async function logTransaction(userId, action, credits, metadata = {}) {
  const txKey = `tx:${userId}:${Date.now()}`;
  await kv.hset(txKey, {
    userId,
    action,
    credits,
    createdAt: new Date().toISOString(),
    ...metadata
  });
  // Set TTL of 30 days for transaction logs
  await kv.expire(txKey, 60 * 60 * 24 * 30);
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
    const userId = req.headers['x-user-id'] || req.body?.userId || req.query?.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID required'
      });
    }

    // GET /api/credits - Get current credits
    if (req.method === 'GET' && !action) {
      const user = await getOrCreateUser(userId);

      return res.status(200).json({
        success: true,
        data: {
          dailyCredits: user.dailyCredits,
          bonusCredits: user.bonusCredits || 0,
          totalCredits: user.dailyCredits + (user.bonusCredits || 0),
          lastResetDate: user.lastResetDate,
          tier: user.tier || 'free',
          totalUsed: user.totalUsed || 0
        }
      });
    }

    // POST /api/credits?action=check - Check if user has enough credits
    if (req.method === 'POST' && action === 'check') {
      const { creditAction, duration, count } = req.body;
      const cost = calculateCost(creditAction, { duration, count });

      const user = await getOrCreateUser(userId);
      const available = user.dailyCredits + (user.bonusCredits || 0);
      const sufficient = available >= cost;

      return res.status(200).json({
        success: true,
        data: {
          cost,
          available,
          sufficient,
          remainingAfter: sufficient ? available - cost : 0,
          shortfall: sufficient ? 0 : cost - available
        }
      });
    }

    // POST /api/credits?action=deduct - Deduct credits
    if (req.method === 'POST' && action === 'deduct') {
      const { creditAction, duration, count, taskId } = req.body;
      const cost = calculateCost(creditAction, { duration, count });

      const user = await getOrCreateUser(userId);
      const available = user.dailyCredits + (user.bonusCredits || 0);

      if (available < cost) {
        return res.status(400).json({
          success: false,
          error: 'insufficient_credits',
          data: {
            cost,
            available,
            shortfall: cost - available
          }
        });
      }

      // Deduct from daily credits first, then bonus
      let remainingCost = cost;
      let newDailyCredits = user.dailyCredits;
      let newBonusCredits = user.bonusCredits || 0;

      if (newDailyCredits >= remainingCost) {
        newDailyCredits -= remainingCost;
        remainingCost = 0;
      } else {
        remainingCost -= newDailyCredits;
        newDailyCredits = 0;
        newBonusCredits -= remainingCost;
      }

      // Update user
      const userKey = `user:${userId}`;
      await kv.hset(userKey, {
        dailyCredits: newDailyCredits,
        bonusCredits: newBonusCredits,
        totalUsed: (user.totalUsed || 0) + cost
      });

      // Log transaction
      await logTransaction(userId, creditAction, -cost, { taskId, duration, count });

      return res.status(200).json({
        success: true,
        data: {
          deducted: cost,
          dailyCredits: newDailyCredits,
          bonusCredits: newBonusCredits,
          totalCredits: newDailyCredits + newBonusCredits
        }
      });
    }

    // POST /api/credits?action=refund - Refund credits (for failed tasks)
    if (req.method === 'POST' && action === 'refund') {
      const { credits, taskId, reason } = req.body;

      if (!credits || credits <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid refund amount'
        });
      }

      const user = await getOrCreateUser(userId);

      // Add back to daily credits (up to DAILY_FREE_CREDITS), rest to bonus
      let newDailyCredits = user.dailyCredits;
      let newBonusCredits = user.bonusCredits || 0;
      let remainingRefund = credits;

      const dailySpace = DAILY_FREE_CREDITS - newDailyCredits;
      if (dailySpace > 0) {
        const toDaily = Math.min(dailySpace, remainingRefund);
        newDailyCredits += toDaily;
        remainingRefund -= toDaily;
      }
      newBonusCredits += remainingRefund;

      const userKey = `user:${userId}`;
      await kv.hset(userKey, {
        dailyCredits: newDailyCredits,
        bonusCredits: newBonusCredits
      });

      // Log refund transaction
      await logTransaction(userId, 'refund', credits, { taskId, reason });

      return res.status(200).json({
        success: true,
        data: {
          refunded: credits,
          dailyCredits: newDailyCredits,
          bonusCredits: newBonusCredits,
          totalCredits: newDailyCredits + newBonusCredits
        }
      });
    }

    // POST /api/credits?action=addBonus - Add bonus credits (from purchases)
    if (req.method === 'POST' && action === 'addBonus') {
      const { credits, source, paymentId } = req.body;

      if (!credits || credits <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid bonus amount'
        });
      }

      const user = await getOrCreateUser(userId);
      const newBonusCredits = (user.bonusCredits || 0) + credits;

      const userKey = `user:${userId}`;
      await kv.hset(userKey, { bonusCredits: newBonusCredits });

      // Log purchase transaction
      await logTransaction(userId, 'purchase', credits, { source, paymentId });

      return res.status(200).json({
        success: true,
        data: {
          added: credits,
          dailyCredits: user.dailyCredits,
          bonusCredits: newBonusCredits,
          totalCredits: user.dailyCredits + newBonusCredits
        }
      });
    }

    return res.status(400).json({
      success: false,
      error: 'Invalid action'
    });

  } catch (error) {
    console.error('Credits API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
