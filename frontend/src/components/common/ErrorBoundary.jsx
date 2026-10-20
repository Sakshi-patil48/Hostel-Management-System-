import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

/**
 * Global React Error Boundary
 * Catches runtime rendering errors and renders a friendly recovery UI
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-screen" style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: 'var(--bg-main, #F8FAFC)',
        }}>
          <div className="error-boundary-card glass-panel" style={{
            maxWidth: '520px',
            width: '100%',
            padding: '36px',
            borderRadius: '20px',
            background: 'var(--surface-card, #FFFFFF)',
            boxShadow: '0 20px 45px rgba(32, 36, 58, 0.12)',
            border: '1px solid var(--border-color, #E5E7EB)',
            textAlign: 'center',
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#FEE2E2',
              color: '#EF4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
            }}>
              <AlertTriangle size={28} />
            </div>

            <h2 style={{
              fontSize: '22px',
              fontWeight: 700,
              color: 'var(--text-primary, #20243A)',
              marginBottom: '10px',
            }}>
              Something went wrong
            </h2>

            <p style={{
              fontSize: '14px',
              color: 'var(--text-secondary, #64748B)',
              marginBottom: '24px',
              lineHeight: 1.6,
            }}>
              The application encountered an unexpected runtime error. We've logged this event. Please reload the page or return to the dashboard.
            </p>

            {this.state.error?.message && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.08)',
                color: '#DC2626',
                padding: '12px 16px',
                borderRadius: '10px',
                fontSize: '12px',
                fontFamily: 'monospace',
                textAlign: 'left',
                marginBottom: '24px',
                overflowX: 'auto',
                wordBreak: 'break-all',
              }}>
                {this.state.error.message}
              </div>
            )}

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
            }}>
              <button
                onClick={this.handleReload}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  background: '#8B7AE8',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '14px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <RefreshCw size={16} />
                <span>Reload Page</span>
              </button>

              <button
                onClick={this.handleGoHome}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  background: 'var(--bg-main, #F1F5F9)',
                  color: 'var(--text-primary, #20243A)',
                  fontWeight: 600,
                  fontSize: '14px',
                  border: '1px solid var(--border-color, #E5E7EB)',
                  cursor: 'pointer',
                }}
              >
                <Home size={16} />
                <span>Go to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
