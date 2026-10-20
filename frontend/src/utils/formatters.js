/**
 * Common formatting helper functions for the Hostel Management System
 */

/**
 * Format numerical amount to Indian Rupee (INR) currency representation
 * @param {number|string} amount
 * @param {boolean} includeSymbol - Whether to prefix with ₹ (default: true)
 * @returns {string} E.g. "₹ 45,000" or "₹ 4,500.00"
 */
export function formatCurrency(amount, includeSymbol = true) {
  const num = Number(amount);
  if (isNaN(num)) return includeSymbol ? '₹ 0' : '0';

  const formatted = num.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: Number.isInteger(num) ? 0 : 2,
  });

  return includeSymbol ? `₹ ${formatted}` : formatted;
}

/**
 * Format date string or timestamp into human-readable date
 * @param {string|Date} date
 * @param {'short'|'medium'|'long'} format
 * @returns {string}
 */
export function formatDate(date, format = 'medium') {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (isNaN(d.getTime())) return String(date);

  if (format === 'short') {
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  if (format === 'long') {
    return d.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  return d.toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Convert numerical section or floor index into user-facing Room Section label
 * @param {number|string} val
 * @returns {string} E.g. "Room A", "Room B", "Room C"
 */
export function getRoomSectionLabel(val) {
  const num = Number(val);
  const map = { 1: 'Room A', 2: 'Room B', 3: 'Room C', 4: 'Room D', 5: 'Room E' };
  return map[num] || `Room ${String.fromCharCode(64 + (num || 1))}`;
}

/**
 * Map status keys to human-friendly display text
 * @param {string} status
 * @returns {string}
 */
export function getStatusLabel(status) {
  if (!status) return 'Unknown';
  const map = {
    active: 'Active',
    inactive: 'Inactive',
    leaved: 'Leaved',
    vacant: 'Vacant',
    occupied: 'Occupied',
    maintenance: 'Maintenance',
    pending: 'Pending',
    partial: 'Partial',
    paid: 'Paid',
    overdue: 'Overdue',
    resolved: 'Resolved',
    in_progress: 'In Progress',
    present: 'Present',
    absent: 'Absent',
    on_leave: 'On Leave',
  };
  return map[status.toLowerCase()] || status.charAt(0).toUpperCase() + status.slice(1);
}

/**
 * Capitalize first letter of string
 * @param {string} str
 * @returns {string}
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default {
  formatCurrency,
  formatDate,
  getRoomSectionLabel,
  getStatusLabel,
  capitalize,
};
