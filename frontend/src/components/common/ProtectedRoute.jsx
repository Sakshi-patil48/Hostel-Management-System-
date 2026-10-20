import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ShieldAlert } from 'lucide-react';

/**
 * Route protection wrapper enforcing authentication and Role-Based Access Control (RBAC).
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string[]} [props.allowedRoles] - Optional list of authorized roles (e.g. ['admin', 'warden'])
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#FAF5FF',
        color: '#7C3AED',
        fontWeight: 700,
        fontSize: '1.1rem'
      }}>
        Authenticating Secure Session...
      </div>
    );
  }

  // 1. If not authenticated, redirect to login page
  if (!isAuthenticated || !user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // 2. Role-Based Access Control (RBAC) check
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = (user.role || '').toLowerCase();
    const isAuthorized = allowedRoles.some((role) => role.toLowerCase() === userRole) ||
      (user.is_staff && allowedRoles.includes('admin'));

    if (!isAuthorized) {
      return (
        <div style={{
          maxWidth: '560px',
          margin: '60px auto',
          padding: '32px',
          borderRadius: '20px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(16px)',
          border: '1px solid #FECDD3',
          boxShadow: '0 8px 30px rgba(225, 29, 72, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            background: '#FFE4E6',
            color: '#E11D48',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <ShieldAlert size={32} />
          </div>

          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#9F1239' }}>
            Access Restricted (RBAC)
          </h2>
          <p style={{ margin: '8px 0 20px', fontSize: '0.92rem', color: '#475569', lineHeight: 1.5 }}>
            Your account ({user.username || 'Current User'} • {user.role || 'Resident'}) does not have permission to access this administrative section.
          </p>

          <a
            href="/dashboard/student-attendance-portal"
            style={{
              display: 'inline-flex',
              padding: '10px 22px',
              borderRadius: '12px',
              background: '#7C3AED',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.9rem',
              textDecoration: 'none'
            }}
          >
            Return to Resident Portal
          </a>
        </div>
      );
    }
  }

  return children;
}
