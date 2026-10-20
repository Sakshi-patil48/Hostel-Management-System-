import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

/**
 * Reusable Feedback Banner for alerts, toasts, and notifications
 *
 * @param {Object} props
 * @param {'success'|'error'|'info'|'warning'} [props.type='info']
 * @param {string} props.message
 * @param {() => void} [props.onClose]
 * @param {string} [props.className='']
 */
export function FeedbackBanner({
  type = 'info',
  message,
  onClose,
  className = '',
}) {
  if (!message) return null;

  const isSuccess = type === 'success';
  const isError = type === 'error';
  const isWarning = type === 'warning';

  const icon = isSuccess ? (
    <CheckCircle2 size={18} className="banner-icon" />
  ) : isError || isWarning ? (
    <AlertCircle size={18} className="banner-icon" />
  ) : (
    <Info size={18} className="banner-icon" />
  );

  const containerClass = isSuccess
    ? 'table-success-toast animate-fadeIn'
    : isError
    ? 'form-error-banner animate-fadeIn'
    : 'form-info-banner animate-fadeIn';

  return (
    <div
      className={`${containerClass} ${className}`}
      role={isError ? 'alert' : 'status'}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {icon}
        <span>{message}</span>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss message"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px',
            color: 'inherit',
            opacity: 0.7,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}

export default FeedbackBanner;
