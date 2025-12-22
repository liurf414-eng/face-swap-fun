import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DAILY_FREE_CREDITS, calculateCost, formatTimeUntilReset } from '../utils/creditCalculator';

const AuthContext = createContext(null);

const SESSION_KEY = 'faceai_session';
const USER_KEY = 'faceai_user';
const GOOGLE_CLIENT_ID = '457199816989-e16gt3va81kalp0nphhqf0rj0v39ij0b.apps.googleusercontent.com';

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
        const savedUser = localStorage.getItem(USER_KEY);

        if (savedUser) {
          const userData = JSON.parse(savedUser);
          setUser(userData);

          // Fetch credits for this user
          await refreshCredits(userData.id);
        }
      } catch (err) {
        console.error('Failed to load session:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, []);

  // Initialize Google Sign-In
  useEffect(() => {
    if (window.google && window.google.accounts && window.google.accounts.id) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
        auto_select: false,
        cancel_on_tap_outside: true
      });
    }
  }, []);

  // Handle Google Sign-In callback
  const handleGoogleCallback = useCallback(async (response) => {
    try {
      if (response.credential) {
        // Decode JWT token to get user info
        const payload = JSON.parse(atob(response.credential.split('.')[1]));

        const userData = {
          id: payload.sub,
          email: payload.email,
          name: payload.name,
          picture: payload.picture
        };

        setUser(userData);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));

        // Fetch/initialize credits for this user
        await refreshCredits(userData.id);
      }
    } catch (err) {
      console.error('Google sign-in error:', err);
      setError('Google sign-in failed. Please try again.');
    }
  }, []);

  // Google Sign-In using OAuth2 token client
  const googleSignIn = useCallback(async () => {
    setError(null);

    if (!window.google || !window.google.accounts) {
      setError('Google API not loaded. Please refresh and try again.');
      return { success: false, error: 'Google API not loaded' };
    }

    return new Promise((resolve) => {
      try {
        window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'openid email profile',
          callback: async (response) => {
            if (response.access_token) {
              try {
                // Fetch user info using the access token
                const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                  headers: {
                    'Authorization': `Bearer ${response.access_token}`
                  }
                });
                const userInfo = await userInfoResponse.json();

                const userData = {
                  id: userInfo.id,
                  email: userInfo.email,
                  name: userInfo.name,
                  picture: userInfo.picture
                };

                setUser(userData);
                localStorage.setItem(USER_KEY, JSON.stringify(userData));

                // Fetch/initialize credits for this user
                await refreshCredits(userData.id);

                resolve({ success: true });
              } catch (err) {
                console.error('Failed to fetch user info:', err);
                setError('Failed to get user information');
                resolve({ success: false, error: 'Failed to get user information' });
              }
            } else {
              resolve({ success: false, error: 'No access token received' });
            }
          }
        }).requestAccessToken({ prompt: 'consent' });
      } catch (err) {
        console.error('OAuth2 error:', err);
        setError('Google sign-in failed');
        resolve({ success: false, error: 'Google sign-in failed' });
      }
    });
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      // Revoke Google token if available
      if (window.google && window.google.accounts) {
        window.google.accounts.id.disableAutoSelect();
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem('user'); // Also clear old user key
      localStorage.removeItem('myVideos');
      setUser(null);
      setCredits({
        dailyCredits: DAILY_FREE_CREDITS,
        bonusCredits: 0,
        totalCredits: DAILY_FREE_CREDITS,
        tier: 'free',
        subscriptionPlan: 'free'
      });
    }
  }, []);

  // Refresh credits from server
  const refreshCredits = useCallback(async (userId = null) => {
    try {
      const uid = userId || user?.id;
      if (!uid) return;

      const res = await fetch(`/api/credits?userId=${uid}`);
      const data = await res.json();

      if (data.success) {
        setCredits({
          dailyCredits: data.data.dailyCredits,
          bonusCredits: data.data.bonusCredits || 0,
          totalCredits: data.data.totalCredits,
          lastResetDate: data.data.lastResetDate,
          tier: data.data.tier || 'free',
          subscriptionPlan: data.data.subscriptionPlan || 'free'
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
      const res = await fetch('/api/credits?action=deduct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
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
      const res = await fetch('/api/credits?action=refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
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
    googleSignIn,
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
