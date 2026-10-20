import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { User, Lock, AlertCircle, Loader2, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import ForgotPasswordModal from './ForgotPasswordModal';

/**
 * LoginForm Component
 * - Premium light lavender-to-white glassmorphic card (#E9E3FF, #F3EEFF, #FFFFFF, #8B7AE8, #25233A)
 * - Modern login button with purple gradient, subtle 3D depth, hover lift, click feedback
 * - Clear "Forgot Password?" interaction with honest recovery modal
 * - Pre-filled demo credentials, show/hide password, and direct redirect to /dashboard/rooms
 */
export default function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Pre-fill with original reference demo values
  const [username, setUsername] = useState('hostel');
  const [password, setPassword] = useState('admin1');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  const [isForgotOpen, setIsForgotOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setErrorMessage('');
    setSuccessNotice('');

    if (!username.trim()) {
      setErrorMessage('Please enter your username.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      // Authenticates with any demo password or real backend
      await login(username, password);
      setSuccessNotice('Access Granted! Opening Manage Room...');

      setTimeout(() => {
        navigate('/dashboard/rooms');
      }, 400);
    } catch (err) {
      setErrorMessage(err.message || 'Error logging in.');
      setLoading(false);
    }
  };

  const handleAutofillCredentials = (newUsername, newPassword) => {
    setUsername(newUsername);
    setPassword(newPassword);
    setErrorMessage('');
  };

  return (
    <div className="login-form-wrapper">
      <div className="login-header-text">
        <h2 className="login-welcome-title">Portal Sign In</h2>
        <p className="login-welcome-subtitle">G H Raisoni Residential Operations</p>
      </div>

      <form onSubmit={handleSubmit} className="login-form" noValidate>
        {/* Success / Redirecting Alert */}
        {successNotice && (
          <div className="login-success-alert" role="status">
            <CheckCircle2 size={18} className="success-icon" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="login-error-alert" role="alert">
            <AlertCircle className="error-icon" size={18} />
            <div className="error-text">
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Username Field */}
        <div className="form-group">
          <label htmlFor="username-input" className="form-label">
            Username
          </label>
          <div className="input-field-container">
            <span className="input-icon-adornment">
              <User size={18} />
            </span>
            <input
              id="username-input"
              type="text"
              name="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              placeholder="e.g. admin or hostel"
              autoComplete="username"
              disabled={loading}
              className="form-input"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="form-group">
          <label htmlFor="password-input" className="form-label">
            Password
          </label>
          <div className="input-field-container">
            <span className="input-icon-adornment">
              <Lock size={18} />
            </span>
            <input
              id="password-input"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={loading}
              className="form-input"
            />
          </div>
        </div>

        {/* Controls Row: Show Password Checkbox & Forgot Password Link */}
        <div className="password-controls-row">
          <div className="show-password-container">
            <label className="checkbox-label" htmlFor="show-password-toggle">
              <input
                type="checkbox"
                id="show-password-toggle"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                disabled={loading}
                className="checkbox-input"
              />
              <span className="checkbox-custom" />
              <span className="checkbox-text">Show Password</span>
            </label>
          </div>

          <button
            type="button"
            className="btn-forgot-password"
            onClick={() => setIsForgotOpen(true)}
            disabled={loading}
          >
            Forgot Password?
          </button>
        </div>

        {/* Modern Purple Gradient Login Button */}
        <div className="button-container">
          <button
            type="submit"
            disabled={loading}
            className={`btn-modern-login ${loading ? 'loading' : ''}`}
            title="Sign in to Dashboard"
          >
            {loading ? (
              <>
                <Loader2 className="btn-spinner animate-spin" size={18} />
                <span>Verifying Access...</span>
              </>
            ) : (
              <>
                <span className="btn-label-text">Sign In</span>
                <ArrowRight size={18} className="btn-arrow-icon" />
              </>
            )}
          </button>
        </div>

        {/* Demo Mode Badge */}
        <div className="backend-status-footer">
          <div className="status-pill demo-pill" title="Any demo username and password will grant access to dashboard">
            <Sparkles size={13} className="status-icon-sparkle" />
            <span>Demo Mode Active:</span>
            <strong>Any password accepted</strong>
          </div>
        </div>
      </form>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
        onAutofillCredentials={handleAutofillCredentials}
      />
    </div>
  );
}
