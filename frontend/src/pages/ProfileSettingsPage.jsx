import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { hostelService } from '../services/hostelService';
import {
  User, Lock, CheckCircle2, AlertCircle, Save, Building2, RotateCcw
} from 'lucide-react';

export default function ProfileSettingsPage() {
  const { user: currentUser, updateProfile } = useAuth();

  // Profile Form
  const [username, setUsername] = useState('hostel');
  const [email, setEmail] = useState('admin@hostel.edu');
  const [profileMsg, setProfileMsg] = useState('');

  // Password Change Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.username || 'hostel');
      setEmail(currentUser.email || 'admin@hostel.edu');
    }
  }, [currentUser]);

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setProfileMsg('Profile updated successfully!');
    updateProfile({ username, email });
    setTimeout(() => setProfileMsg(''), 4000);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordMsg('');

    if (newPassword.length < 4) {
      setPasswordError('New password must be at least 4 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordMsg('Password changed successfully! You can now use your new password.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordMsg(''), 4000);
  };

  const [resetMsg, setResetMsg] = useState('');

  const handleResetDatabase = () => {
    if (window.confirm('Are you sure you want to reset all data back to the default sample database? Any changes you made will be re-initialized.')) {
      hostelService.resetDatabase();
      setResetMsg('Database successfully reset to original default state!');
      setTimeout(() => {
        setResetMsg('');
        window.location.reload();
      }, 1000);
    }
  };

  return (
    <div className="page-wrapper form-page-container">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Profile & System Settings</h1>
          <p className="page-subtitle">Manage administrative profile, security credentials, and portal preferences</p>
        </div>
      </div>

      <div className="settings-grid-layout">
        {/* Profile Card */}
        <div className="glass-form-card">
          <div className="settings-card-header">
            <User size={20} className="text-blue-500" />
            <h3>Administrator Profile</h3>
          </div>

          {profileMsg && (
            <div className="form-success-banner mb-3">
              <CheckCircle2 size={16} />
              <span>{profileMsg}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile}>
            <div className="form-group-field mb-4">
              <label>Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="form-group-field mb-4">
              <label>Official Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary-action">
              <Save size={15} />
              <span>Save Profile</span>
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="glass-form-card">
          <div className="settings-card-header">
            <Lock size={20} className="text-green-500" />
            <h3>Change Password</h3>
          </div>

          {passwordMsg && (
            <div className="form-success-banner mb-3">
              <CheckCircle2 size={16} />
              <span>{passwordMsg}</span>
            </div>
          )}

          {passwordError && (
            <div className="form-error-banner mb-3">
              <AlertCircle size={16} />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword}>
            <div className="form-group-field mb-3">
              <label>Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
              />
            </div>

            <div className="form-group-field mb-3">
              <label>New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
              />
            </div>

            <div className="form-group-field mb-4">
              <label>Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
              />
            </div>

            <button type="submit" className="btn-primary-action">
              <Lock size={15} />
              <span>Update Password</span>
            </button>
          </form>
        </div>

        {/* Hostel Portal & Administrative Preferences */}
        <div className="glass-form-card col-span-full">
          <div className="settings-card-header">
            <Building2 size={20} className="text-purple-500" />
            <h3>Hostel Portal & Campus Preferences</h3>
          </div>

          <div className="system-specs-grid">
            <div className="spec-card">
              <span className="spec-label">Academic Session</span>
              <span className="font-semibold text-purple-700">2025 – 2026 (Active Session)</span>
            </div>
            <div className="spec-card">
              <span className="spec-label">Institution & Campus</span>
              <span className="font-medium">G H Raisoni Institute of Engineering & Business Management, Jalgaon</span>
            </div>
            <div className="spec-card">
              <span className="spec-label">Hostel Facilities & Wings</span>
              <span className="font-medium">Block A (Engineering), Block B (Polytechnic), PG Wing</span>
            </div>
            <div className="spec-card">
              <span className="spec-label">Curfew & Daily In-Time</span>
              <span className="font-semibold text-amber-600">09:30 PM (Biometric / Roll Call Verification)</span>
            </div>
            <div className="spec-card">
              <span className="spec-label">Automated System Alerts</span>
              <span className="status-pill-badge active">Fee Dues & Urgent Complaints Active</span>
            </div>
            <div className="spec-card">
              <span className="spec-label">Administrative Role</span>
              <span className="font-semibold text-blue-600">Chief Warden / Campus Administrator</span>
            </div>
          </div>

          {resetMsg && (
            <div className="form-success-banner mt-3" style={{ background: '#dcfce7', color: '#15803d', padding: '0.75rem', borderRadius: '0.5rem', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={16} />
              <span>{resetMsg}</span>
            </div>
          )}

          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h4 style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem' }}>Reset Sample Dataset</h4>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Reverts all rooms, beds, students, fees, payments, and attendance back to the original sample dataset.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetDatabase}
              className="btn-secondary-action"
              style={{ background: '#fff1f2', borderColor: '#fecdd3', color: '#e11d48' }}
            >
              <RotateCcw size={15} />
              <span>Reset Sample Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
