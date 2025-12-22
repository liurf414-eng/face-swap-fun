import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DAILY_FREE_CREDITS, calculateCost, formatTimeUntilReset } from '../utils/creditCalculator';

const AuthContext = createContext(null);

const SESSION_KEY = 'faceai_session';
const USER_KEY = 'faceai_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState({
    dailyCredits: DAILY_FREE_CREDITS,
    bonusCredits: 0,
    totalCredits: DAILY_FREE_CREDITS,
    lastResetDate: null,
    tier: 'free',
    subscriptionPlan: 'free'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load session from localStorage on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        const savedSession = localStorage.getItem(SESSION_KEY);
        const savedUser = localStorage.getItem(USER_KEY);

        if (savedSession && savedUser) {
          const sessionData = JSON.parse(savedSession);
          const userData = JSON.parse(savedUser);

          // Validate session with server
          const res = await fetch('/api/auth?action=session', {
            headers: {
              'Authorization': `Bearer ${sessionData.sessionToken}`
            }
          });

          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              setUser({
                id: data.data.userId,
                email: data.data.email
              });
              setCredits({
                dailyCredits: data.data.dailyCredits,
                bonusCredits: data.data.bonusCredits || 0,
                totalCredits: data.data.dailyCredits + (data.data.bonusCredits || 0),
                tier: data.data.tier
              });
            } else {
              // Invalid session, clear storage
              localStorage.removeItem(SESSION_KEY);
              localStorage.removeItem(USER_KEY);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load session:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, []);

  // Send verification code to email
  const sendCode = useCallback(async (email) => {
    setError(null);
    try {
      const res = await fetch('/api/auth?action=sendCode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to send code');
      }

      return { success: true, ...data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  // Verify code and login
  const verifyCode = useCallback(async (email, code) => {
    setError(null);
    try {
      const res = await fetch('/api/auth?action=verifyCode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Invalid code');
      }

      // Save session
      localStorage.setItem(SESSION_KEY, JSON.stringify({
        sessionToken: data.data.sessionToken
      }));
      localStorage.setItem(USER_KEY, JSON.stringify({
        id: data.data.userId,
        email: data.data.email
      }));

      setUser({
        id: data.data.userId,
        email: data.data.email
      });

      // Fetch credits
      await refreshCredits(data.data.userId, data.data.sessionToken);

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  // Verify magic link token
  const verifyToken = useCallback(async (email, token) => {
    setError(null);
    try {
      const res = await fetch('/api/auth?action=verifyToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Invalid link');
      }

      // Save session
      localStorage.setItem(SESSION_KEY, JSON.stringify({
        sessionToken: data.data.sessionToken
      }));
      localStorage.setItem(USER_KEY, JSON.stringify({
        id: data.data.userId,
        email: data.data.email
      }));

      setUser({
        id: data.data.userId,
        email: data.data.email
      });

      // Fetch credits
      await refreshCredits(data.data.userId, data.data.sessionToken);

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      const savedSession = localStorage.getItem(SESSION_KEY);
      if (savedSession) {
        const { sessionToken } = JSON.parse(savedSession);
        await fetch('/api/auth?action=logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sessionToken}`
          }
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(USER_KEY);
      setUser(null);
      setCredits({
        dailyCredits: DAILY_FREE_CREDITS,
        bonusCredits: 0,
        totalCredits: DAILY_FREE_CREDITS,
        tier: 'free'
      });
    }
  }, []);

  // Refresh credits from server
  const refreshCredits = useCallback(async (userId = null, sessionToken = null) => {
    try {
      const uid = userId || user?.id;
      if (!uid) return;

      let token = sessionToken;
      if (!token) {
        const savedSession = localStorage.getItem(SESSION_KEY);
        if (savedSession) {
          token = JSON.parse(savedSession).sessionToken;
        }
      }

      const res = await fetch(`/api/credits?userId=${uid}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      const data = await res.json();
      if (data.success) {
        setCredits({
          dailyCredits: data.data.dailyCredits,
          bonusCredits: data.data.bonusCredits || 0,
          totalCredits: data.data.totalCredits,
          lastResetDate: data.data.lastResetDate,
          tier: data.data.tier || 'free'
        });
      }
    } catch (err) {
      console.error('Failed to refresh credits:', err);
    }
  }, [user]);

  // Check if user has enough credits for an action
  const checkCredits = useCallback(async (action, params = {}) => {
    if (!user) {
      return {
        success: false,
        error: 'login_required',
        message: 'Please login to continue'
      };
    }

    const cost = calculateCost(action, params);

    if (credits.totalCredits >= cost) {
      return {
        success: true,
        cost,
        remaining: credits.totalCredits - cost
      };
    }

    return {
      success: false,
      error: 'insufficient_credits',
      cost,
      available: credits.totalCredits,
      shortfall: cost - credits.totalCredits
    };
  }, [user, credits]);

  // Deduct credits
  const deductCredits = useCallback(async (action, params = {}) => {
    if (!user) {
      return { success: false, error: 'Not logged in' };
    }

    try {
      const savedSession = localStorage.getItem(SESSION_KEY);
      const token = savedSession ? JSON.parse(savedSession).sessionToken : null;

      const res = await fetch('/api/credits?action=deduct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          userId: user.id,
          creditAction: action,
          ...params
        })
      });

      const data = await res.json();
      if (data.success) {
        setCredits({
          ...credits,
          dailyCredits: data.data.dailyCredits,
          bonusCredits: data.data.bonusCredits,
          totalCredits: data.data.totalCredits
        });
        return { success: true, deducted: data.data.deducted };
      }

      return { success: false, error: data.error };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [user, credits]);

  // Refund credits (for failed tasks)
  const refundCredits = useCallback(async (amount, taskId, reason) => {
    if (!user) return { success: false };

    try {
      const savedSession = localStorage.getItem(SESSION_KEY);
      const token = savedSession ? JSON.parse(savedSession).sessionToken : null;

      const res = await fetch('/api/credits?action=refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          userId: user.id,
          credits: amount,
          taskId,
          reason
        })
      });

      const data = await res.json();
      if (data.success) {
        setCredits({
          ...credits,
          dailyCredits: data.data.dailyCredits,
          bonusCredits: data.data.bonusCredits,
          totalCredits: data.data.totalCredits
        });
        return { success: true };
      }

      return { success: false };
    } catch (err) {
      return { success: false };
    }
  }, [user, credits]);

  const value = {
    user,
    credits,
    loading,
    error,
    isLoggedIn: !!user,
    sendCode,
    verifyCode,
    verifyToken,
    logout,
    refreshCredits,
    checkCredits,
    deductCredits,
    refundCredits,
    formatTimeUntilReset
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
