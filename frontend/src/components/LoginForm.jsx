import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { API_BASE_URL } from '../services/api';
import { User, Lock, AlertCircle, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';

/**
 * LoginForm Component
 * - Recreates the login fields and green button from Reference Screenshot 1
 * - Pre-filled with 'hostel' and 'admin1' matching the screenshot
 * - Accepts ANY demo password as requested by user
 * - Functional "Show Password" checkbox
 * - Navigates smoothly to /dashboard on click
 */
export default function LoginForm() {
  const navigate = useNavigate();

  // Pre-fill with original Screenshot 1 values
  const [username, setUsername] = useState('hostel');
  const [password, setPassword] = useState('admin1');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setErrorMessage('');
    setSuccessNotice('');

    setLoading(true);

    try {
      // Authenticates with any demo password or real backend
      await authService.login(username, password);
      setSuccessNotice('Access Granted! Opening Manage Room...');
      
      setTimeout(() => {
        navigate('/dashboard/rooms');
      }, 400);
    } catch (err) {
      setErrorMessage(err.message || 'Error logging in.');
      setLoading(false);
    }
  };

  return (
    <div className="login-form-wrapper">
      <form onSubmit={handleSubmit} className="login-form" noValidate>
        {/* Success / Redirecting Alert */}
        {successNotice && (
          <div className="login-success-alert" role="status">
            <CheckCircle2 size={18} className="text-green-600" />
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
              <User size={16} />
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
              placeholder="e.g. hostel / admin / any name"
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
              <Lock size={16} />
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
              placeholder="Enter any demo password"
              autoComplete="current-password"
              disabled={loading}
              className="form-input"
            />
          </div>
        </div>

        {/* Show Password Checkbox (Matching Screenshot 1) */}
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

        {/* 3D Glossy Green Login Button (Matching Screenshot 1) */}
        <div className="button-container">
          <button
            type="submit"
            disabled={loading}
            className={`btn-3d-green-login ${loading ? 'loading' : ''}`}
            title="Login to Dashboard"
          >
            {loading ? (
              <>
                <Loader2 className="btn-spinner animate-spin" size={18} />
                <span>Logging In...</span>
              </>
            ) : (
              <>
                {/* Iconic glossy 3D orb accent matching original reference */}
                <span className="btn-orb-gem" aria-hidden="true">
                  <span className="orb-highlight" />
                </span>
                <span className="btn-label-text">Login</span>
              </>
            )}
          </button>
        </div>

        {/* Demo Mode Badge */}
        <div className="backend-status-footer">
          <div className="status-pill demo-pill" title="Any demo username and password will grant access to dashboard">
            <Sparkles size={12} className="status-icon-sparkle" />
            <span>Demo Mode Active:</span>
            <strong>Any password accepted</strong>
          </div>
        </div>
      </form>
    </div>
  );
}
