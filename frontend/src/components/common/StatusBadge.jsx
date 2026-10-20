import React from 'react';
import { getStatusLabel } from '../../utils/formatters';

/**
 * Standardized Status Badge Component
 *
 * @param {Object} props
 * @param {string} props.status - e.g. 'active', 'vacant', 'occupied', 'paid', 'partial', 'pending', 'resolved'
 * @param {string} [props.label] - Optional custom display label
 * @param {string} [props.className='']
 */
export function StatusBadge({ status = 'active', label, className = '' }) {
  const normalizedStatus = (status || '').toLowerCase().replace(/\s+/g, '_');
  const displayText = label || getStatusLabel(normalizedStatus);

  return (
    <span className={`status-pill-badge ${normalizedStatus} ${className}`}>
      {displayText}
    </span>
  );
}

export default StatusBadge;
