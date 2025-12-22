import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { DAILY_FREE_CREDITS } from '../../utils/creditCalculator';
import './CreditsDisplay.css';

export default function CreditsDisplay({ onLoginClick, onBuyClick }) {
  const { user, credits, isLoggedIn, logout, formatTimeUntilReset } = useAuth();
  const [isCreditsDropdownOpen, setIsCreditsDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [timeUntilReset, setTimeUntilReset] = useState('');

  // Update countdown timer
  useEffect(() => {
    const updateTimer = () => {
      setTimeUntilReset(formatTimeUntilReset());
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [formatTimeUntilReset]);

  const percentage = Math.min(100, (credits.dailyCredits / DAILY_FREE_CREDITS) * 100);

  // Close dropdowns when clicking outside
  const closeAllDropdowns = () => {
    setIsCreditsDropdownOpen(false);
    setIsUserDropdownOpen(false);
  };

  if (!isLoggedIn) {
    return (
      <button className="credits-login-btn" onClick={onLoginClick}>
        Sign In
      </button>
    );
  }

  return (
    <div className="navbar-right">
      {/* Credits Display */}
      <div className="credits-display">
        <button
          className="credits-trigger"
          onClick={() => {
            setIsCreditsDropdownOpen(!isCreditsDropdownOpen);
            setIsUserDropdownOpen(false);
          }}
        >
          <span className="credits-icon">⚡</span>
          <span className="credits-amount">{credits.totalCredits}</span>
        </button>

        {isCreditsDropdownOpen && (
          <>
            <div
              className="credits-dropdown-overlay"
              onClick={closeAllDropdowns}
            />
            <div className="credits-dropdown">
              <div className="credits-dropdown-header">
                <span className="credits-icon-large">⚡</span>
                <span>Your Credits</span>
              </div>

              <div className="credits-section">
                <div className="credits-row">
                  <span>Daily Credits</span>
                  <span>{credits.dailyCredits} / {DAILY_FREE_CREDITS}</span>
                </div>
                <div className="credits-progress">
                  <div
                    className="credits-progress-bar"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>

              {credits.bonusCredits > 0 && (
                <div className="credits-section">
                  <div className="credits-row">
                    <span>Bonus Credits</span>
                    <span>{credits.bonusCredits}</span>
                  </div>
                </div>
              )}

              <div className="credits-divider" />

              <div className="credits-section">
                <div className="credits-row credits-total">
                  <span>Total Available</span>
                  <span>{credits.totalCredits}</span>
                </div>
              </div>

              <div className="credits-reset-info">
                <span>↻</span>
                <span>Resets in {timeUntilReset}</span>
              </div>

              <button className="credits-buy-btn" onClick={() => {
                closeAllDropdowns();
                onBuyClick?.();
              }}>
                Get More Credits
              </button>
            </div>
          </>
        )}
      </div>

      {/* User Avatar & Menu */}
      <div className="user-display">
        <button
          className="user-trigger"
          onClick={() => {
            setIsUserDropdownOpen(!isUserDropdownOpen);
            setIsCreditsDropdownOpen(false);
          }}
        >
          {user?.picture ? (
            <img src={user.picture} alt="" className="user-avatar" />
          ) : (
            <span className="user-avatar-placeholder">{user?.name?.[0] || '?'}</span>
          )}
        </button>

        {isUserDropdownOpen && (
          <>
            <div
              className="credits-dropdown-overlay"
              onClick={closeAllDropdowns}
            />
            <div className="user-dropdown">
              <div className="user-dropdown-header">
                {user?.picture && (
                  <img src={user.picture} alt="" className="user-avatar-large" />
                )}
                <div className="user-info">
                  <span className="user-name">{user?.name}</span>
                  <span className="user-email">{user?.email}</span>
                </div>
              </div>

              <div className="user-divider" />

              <button className="user-menu-item" onClick={() => {
                closeAllDropdowns();
                onBuyClick?.();
              }}>
                <span>⭐</span>
                <span>Upgrade Plan</span>
              </button>

              <button className="user-logout-btn" onClick={() => {
                closeAllDropdowns();
                logout();
              }}>
                <span>🚪</span>
                <span>Sign Out</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
