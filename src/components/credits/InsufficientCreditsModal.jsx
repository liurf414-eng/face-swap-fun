import './InsufficientCreditsModal.css';

export default function InsufficientCreditsModal({
  isOpen,
  onClose,
  cost,
  available,
  onBuyCredits,
  timeUntilReset
}) {
  if (!isOpen) return null;

  const shortfall = cost - available;

  return (
    <div className="insufficient-modal-overlay" onClick={onClose}>
      <div className="insufficient-modal" onClick={(e) => e.stopPropagation()}>
        <button className="insufficient-modal-close" onClick={onClose}>
          &times;
        </button>

        <div className="insufficient-icon">&#9888;&#65039;</div>

        <h2>Insufficient Credits</h2>

        <div className="insufficient-details">
          <div className="detail-row">
            <span>Required:</span>
            <span className="detail-value">{cost} credits</span>
          </div>
          <div className="detail-row">
            <span>Available:</span>
            <span className="detail-value available">{available} credits</span>
          </div>
          <div className="detail-row shortfall">
            <span>Need more:</span>
            <span className="detail-value">{shortfall} credits</span>
          </div>
        </div>

        <div className="insufficient-options">
          <button className="buy-credits-btn" onClick={onBuyCredits}>
            <span>&#128722;</span>
            Buy Credits
          </button>

          <div className="or-divider">
            <span>or</span>
          </div>

          <div className="wait-option">
            <span>&#8635;</span>
            <span>Wait for daily reset in <strong>{timeUntilReset}</strong></span>
          </div>
        </div>

        <button className="cancel-btn" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
