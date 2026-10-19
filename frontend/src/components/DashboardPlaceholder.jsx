import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Shield, Sparkles } from 'lucide-react';

/**
 * DashboardPlaceholder Component
 * Route: /dashboard
 * Placeholder for Step 2 of the Hostel Management System project.
 */
export default function DashboardPlaceholder() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-placeholder-screen">
      <div className="placeholder-card animate-mount">
        <div className="placeholder-badge">
          <Sparkles size={16} />
          <span>Step 1 Complete</span>
        </div>

        <h1 className="placeholder-title">Hostel Management Dashboard</h1>
        <p className="placeholder-subtitle">
          Placeholder Route: <code>/dashboard</code>
        </p>

        <div className="placeholder-info-box">
          <div className="info-item">
            <CheckCircle className="text-green-500" size={18} />
            <span>Step 1 (3D Animated Login Page) is fully built and ready for review.</span>
          </div>
          <div className="info-item">
            <Shield className="text-blue-500" size={18} />
            <span>The full Navigator Bar dashboard from Screenshot 2 will be built in Step 2 upon your confirmation.</span>
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="btn-return-login"
        >
          <ArrowLeft size={16} />
          <span>Return to 3D Login Page</span>
        </button>
      </div>
    </div>
  );
}
