import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './AuthModal.css';

export default function AuthModal({ isOpen, onClose }) {
  const { sendCode, verifyCode, error } = useAuth();
  const [step, setStep] = useState('email'); // 'email' | 'code'
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  if (!isOpen) return null;

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setLocalError('');

    const result = await sendCode(email);
    setLoading(false);

    if (result.success) {
      setStep('code');
    } else {
      setLocalError(result.error || 'Failed to send code');
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!code) return;

    setLoading(true);
    setLocalError('');

    const result = await verifyCode(email, code);
    setLoading(false);

    if (result.success) {
      onClose();
      setStep('email');
      setEmail('');
      setCode('');
    } else {
      setLocalError(result.error || 'Invalid code');
    }
  };

  const handleClose = () => {
    onClose();
    setStep('email');
    setEmail('');
    setCode('');
    setLocalError('');
  };

  return (
    <div className="auth-modal-overlay" onClick={handleClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={handleClose}>
          &times;
        </button>

        <div className="auth-modal-header">
          <h2>Sign in to FaceAI Hub</h2>
          <p>Get 200 free credits daily</p>
        </div>

        {step === 'email' ? (
          <form onSubmit={handleSendCode} className="auth-form">
            <div className="auth-input-group">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                autoFocus
              />
            </div>

            {(localError || error) && (
              <div className="auth-error">{localError || error}</div>
            )}

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading || !email}
            >
              {loading ? 'Sending...' : 'Send verification code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="auth-form">
            <p className="auth-info">
              We sent a code to <strong>{email}</strong>
            </p>

            <div className="auth-input-group">
              <label htmlFor="code">Verification code</label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit code"
                required
                autoFocus
                maxLength={6}
                pattern="[0-9]{6}"
              />
            </div>

            {(localError || error) && (
              <div className="auth-error">{localError || error}</div>
            )}

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading || code.length !== 6}
            >
              {loading ? 'Verifying...' : 'Verify and sign in'}
            </button>

            <button
              type="button"
              className="auth-back-btn"
              onClick={() => {
                setStep('email');
                setCode('');
                setLocalError('');
              }}
            >
              Use different email
            </button>
          </form>
        )}

        <div className="auth-footer">
          <p>By signing in, you agree to our Terms of Service</p>
        </div>
      </div>
    </div>
  );
}
