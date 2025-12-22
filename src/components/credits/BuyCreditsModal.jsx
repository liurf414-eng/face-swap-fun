import { useState } from 'react';
import { SUBSCRIPTION_PLANS, DAILY_FREE_CREDITS } from '../../utils/creditCalculator';
import './BuyCreditsModal.css';

export default function BuyCreditsModal({ isOpen, onClose, currentPlan = 'free', dailyCredits = 100 }) {
  if (!isOpen) return null;

  const plans = Object.values(SUBSCRIPTION_PLANS);

  return (
    <div className="buy-modal-overlay" onClick={onClose}>
      <div className="buy-modal subscription-modal" onClick={(e) => e.stopPropagation()}>
        <button className="buy-modal-close" onClick={onClose}>
          &times;
        </button>

        <div className="buy-modal-header">
          <h2>Subscribe</h2>
        </div>

        {/* Current Status */}
        <div className="subscription-status">
          <div className="status-card">
            <div className="status-label">My Plan</div>
            <div className="status-info">
              <span>Current plan</span>
              <span className="status-value">{currentPlan === 'free' ? 'Free Plan' : SUBSCRIPTION_PLANS[currentPlan]?.name}</span>
            </div>
          </div>
          <div className="status-card">
            <div className="status-label">My credits</div>
            <div className="status-info">
              <span>My daily credits</span>
              <span className="status-value credits-value">{dailyCredits}/{DAILY_FREE_CREDITS}</span>
            </div>
          </div>
        </div>

        <h3 className="choose-plan-title">Choose your plan</h3>

        {/* Plans Grid */}
        <div className="plans-grid">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`plan-card ${currentPlan === plan.id ? 'current' : ''}`}
            >
              {plan.badge && <span className="plan-badge">{plan.badge}</span>}

              <div className="plan-header">
                <h4 className={plan.id !== 'free' ? 'plan-name-gradient' : ''}>{plan.name}</h4>
              </div>

              <div className="plan-price">
                <span className="price-amount">${plan.price}</span>
                {plan.period && <span className="price-period">{plan.period}</span>}
              </div>

              <div className="plan-desc">{plan.description}</div>

              {currentPlan === plan.id ? (
                <button className="plan-btn current-btn" disabled>
                  Current Plan
                </button>
              ) : plan.id === 'free' ? (
                <div className="plan-btn-placeholder"></div>
              ) : (
                <button className="plan-btn subscribe-btn coming-soon" disabled>
                  Coming Soon
                </button>
              )}

              <ul className="plan-features">
                {plan.features.map((feature, idx) => (
                  <li key={idx}>
                    <span className="feature-check">✓</span>
                    {feature.includes('1200') || feature.includes('4000') || feature.includes('13000') ? (
                      <span dangerouslySetInnerHTML={{
                        __html: feature.replace(/(\d+)/, '<strong class="credits-highlight">$1</strong>')
                      }} />
                    ) : (
                      feature
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="buy-footer">
          <p>Payment options coming soon!</p>
        </div>
      </div>
    </div>
  );
}
