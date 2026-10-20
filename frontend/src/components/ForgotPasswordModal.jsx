import React, { useState, useEffect } from 'react';
import { Mail, AlertCircle, CheckCircle2, X, KeyRound, ShieldAlert, Copy, Check } from 'lucide-react';

/**
 * ForgotPasswordModal Component
 * - Elegant glassmorphic modal matching the lavender palette (#E9E3FF, #F3EEFF, #8B7AE8, #25233A)
 * - Honest recovery interface: explains local/demo auth status without faking SMTP emails
 * - Validates registered identifier/email
 * - Provides quick-copy and autofill for demo credentials
 */
export default function ForgotPasswordModal({ isOpen, onClose, onAutofillCredentials }) {
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIdentifier('');
      setError('');
      setIsSubmitted(false);
      setCopied(false);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const clean = identifier.trim();
    if (!clean) {
      setError('Please enter your registered email address or username.');
      return;
    }

    if (clean.includes('@') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      setError('Please enter a valid email format (e.g. admin@raisoni.net).');
      return;
    }

    setIsSubmitted(true);
  };

  const handleCopyCredentials = () => {
    navigator.clipboard.writeText('Username: admin\nPassword: admin123');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAutofillAndClose = () => {
    if (onAutofillCredentials) {
      onAutofillCredentials('admin', 'admin123');
    }
    onClose();
  };

  return (
    <div
      className="forgot-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="forgot-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="forgot-modal-card">
        {/* Modal Top Glass Highlight */}
        <div className="card-top-highlight" />

        {/* Modal Header */}
        <div className="forgot-modal-header">
          <div className="forgot-modal-icon-badge">
            <KeyRound size={20} className="text-violet-600" />
          </div>
          <div className="forgot-modal-header-text">
            <h3 id="forgot-modal-title" className="forgot-modal-title">
              Account Password Recovery
            </h3>
            <p className="forgot-modal-subtitle">G H Raisoni Hostel Residential Portal</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="forgot-modal-close-btn"
            aria-label="Close recovery dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="forgot-modal-body">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="forgot-modal-form" noValidate>
              <p className="forgot-modal-description">
                Enter your registered administrator email address or username. We will guide you through password recovery.
              </p>

              {error && (
                <div className="login-error-alert" role="alert">
                  <AlertCircle size={16} className="error-icon" />
                  <span>{error}</span>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="recovery-identifier" className="form-label">
                  Registered Email or Username
                </label>
                <div className="input-field-container">
                  <span className="input-icon-adornment">
                    <Mail size={16} />
                  </span>
                  <input
                    id="recovery-identifier"
                    type="text"
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="e.g. admin@raisoni.net or admin"
                    className="form-input"
                    autoFocus
                  />
                </div>
              </div>

              <div className="forgot-modal-actions">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-modal-cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-modal-submit"
                >
                  Request Recovery
                </button>
              </div>
            </form>
          ) : (
            <div className="forgot-modal-success-content">
              <div className="recovery-status-pill">
                <CheckCircle2 size={20} className="text-violet-600" />
                <span>Recovery Request Processed</span>
              </div>

              <div className="recovery-explanation-box">
                <div className="recovery-notice-header">
                  <ShieldAlert size={16} className="text-violet-500" />
                  <strong>Institutional Environment Notice</strong>
                </div>
                <p>
                  This system is currently running in <strong>Local & Demo Evaluation Mode</strong>. Automated external SMTP email dispatch is disabled for local security.
                </p>
                <p>
                  You can immediately access all system features using the designated administrator credentials:
                </p>

                <div className="demo-credentials-card">
                  <div className="credentials-row">
                    <span className="cred-label">Username:</span>
                    <code className="cred-val">admin</code>
                  </div>
                  <div className="credentials-row">
                    <span className="cred-label">Password:</span>
                    <code className="cred-val">admin123</code>
                  </div>
                  <span className="cred-hint"><em>(Any demo password is also accepted)</em></span>
                </div>

                <div className="backend-requirement-box">
                  <span className="req-title">Production Backend Requirement:</span>
                  <p className="req-text">
                    For production automated password reset emails, configure Django SMTP settings in <code>backend/hostel_backend/settings.py</code> (<code>EMAIL_HOST</code>, <code>EMAIL_HOST_USER</code>, <code>EMAIL_HOST_PASSWORD</code>) and an authentication reset token endpoint.
                  </p>
                </div>
              </div>

              <div className="forgot-modal-actions success-actions">
                <button
                  type="button"
                  onClick={handleCopyCredentials}
                  className="btn-modal-cancel"
                >
                  {copied ? <Check size={14} className="inline mr-1" /> : <Copy size={14} className="inline mr-1" />}
                  {copied ? 'Copied!' : 'Copy Credentials'}
                </button>
                <button
                  type="button"
                  onClick={handleAutofillAndClose}
                  className="btn-modal-submit"
                >
                  Autofill & Login
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
