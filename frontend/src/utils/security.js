/**
 * Application Security & Input Sanitization Utilities
 * Protects form data against Cross-Site Scripting (XSS), script injections, and malformed characters.
 */

/**
 * Sanitizes a plain text string by stripping executable script tags,
 * removing null bytes, and normalizing whitespace.
 *
 * @param {string|any} value - Input value to sanitize
 * @param {Object} [options]
 * @param {number} [options.maxLength=5000] - Truncate length
 * @returns {string} Sanitized string
 */
export function sanitizeInput(value, options = {}) {
  if (value === null || value === undefined) {
    return '';
  }

  let str = String(value);

  // Strip null bytes
  str = str.replace(/\0/g, '');

  // Strip <script> and dangerous HTML tags
  str = str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  str = str.replace(/<(iframe|object|embed|applet)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi, '');

  // Strip javascript: pseudo-protocols and inline event handlers
  str = str.replace(/javascript\s*:/gi, '');
  str = str.replace(/on\w+\s*=/gi, '');

  // Enforce max length
  const maxLength = options.maxLength || 5000;
  if (str.length > maxLength) {
    str = str.slice(0, maxLength);
  }

  return str.trim();
}

/**
 * Recursively sanitizes all string fields within an object/form payload.
 *
 * @param {Object} data - Payload object to sanitize
 * @returns {Object} Cleaned object
 */
export function sanitizeFormPayload(data) {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => (typeof item === 'object' ? sanitizeFormPayload(item) : sanitizeInput(item)));
  }

  const cleaned = {};
  for (const [key, val] of Object.entries(data)) {
    if (typeof val === 'string') {
      cleaned[key] = sanitizeInput(val);
    } else if (val && typeof val === 'object') {
      cleaned[key] = sanitizeFormPayload(val);
    } else {
      cleaned[key] = val;
    }
  }

  return cleaned;
}

/**
 * Validates whether an email format is legitimate and safe.
 *
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return re.test(email.trim());
}

/**
 * Validates a standard Indian 10-digit phone number.
 *
 * @param {string} phone
 * @returns {boolean}
 */
export function isValidPhone(phone) {
  if (!phone) return false;
  const clean = String(phone).replace(/\D/g, '');
  return clean.length >= 10 && clean.length <= 12;
}

export default {
  sanitizeInput,
  sanitizeFormPayload,
  isValidEmail,
  isValidPhone,
};
