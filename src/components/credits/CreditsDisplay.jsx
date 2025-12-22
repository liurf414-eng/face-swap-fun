import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { DAILY_FREE_CREDITS } from '../../utils/creditCalculator';
import './CreditsDisplay.css';

export default function CreditsDisplay({ onLoginClick, onBuyClick }) {
  const { user, credits, isLoggedIn, logout, formatTimeUntilReset } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

  if (!isLoggedIn) {
    return (
      <button className="credits-login-btn" onClick={onLoginClick}>
        Sign In
      </button>
    );
  }

  return (
    <div className="credits-display">
      <button
        className="credits-trigger"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        {user?.picture ? (
          <img src={user.picture} alt="" className="credits-user-avatar" />
        ) : (
          <span className="credits-icon">&#9889;</span>
        )}
        <span className="credits-amount">{credits.totalCredits}</span>
        <span className="credits-arrow">{isDropdownOpen ? '▲' : '▼'}</span>
      </button>

      {isDropdownOpen && (
        <>
          <div
            className="credits-dropdown-overlay"
            onClick={() => setIsDropdownOpen(false)}
          />
          <div className="credits-dropdown">
            {/* User Info Header */}
            {user && (
              <div className="credits-user-header">
                {user.picture && (
                  <img src={user.picture} alt="" className="credits-avatar-large" />
                )}
                <div className="credits-user-info">
                  <span className="credits-user-name">{user.name}</span>
                  <span className="credits-user-email">{user.email}</span>
                </div>
              </div>
            )}

            <div className="credits-divider" />

            <div className="credits-dropdown-header">
              <span className="credits-icon-large">&#9889;</span>
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
              <span>&#8635;</span>
              <span>Resets in {timeUntilReset}</span>
            </div>

            <button className="credits-buy-btn" onClick={() => {
              setIsDropdownOpen(false);
              onBuyClick?.();
            }}>
              <span>&#128722;</span>
              Get More Credits
            </button>

            <button className="credits-logout-btn-full" onClick={() => {
              setIsDropdownOpen(false);
              logout();
            }}>
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
