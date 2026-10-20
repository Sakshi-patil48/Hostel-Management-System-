/**
 * Application Environment Configuration
 * Centralizes all environment variables and configuration constants.
 * Single source of truth across the application.
 */

/**
 * Normalizes the API base URL from environment variables.
 * - Supports VITE_API_BASE_URL and VITE_API_URL
 * - Automatically ensures '/api' is present without duplicating '/api/api'
 * - Strips trailing slashes
 */
function resolveApiBaseUrl() {
  const raw = (
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    'http://127.0.0.1:8000/api'
  ).trim();

  let clean = raw.replace(/\/+$/, '');
  if (!/\/api$/i.test(clean)) {
    clean = `${clean}/api`;
  }
  return clean;
}

export const ENV = {
  // Django REST Framework Base API URL (guaranteed normalized with /api)
  API_BASE_URL: resolveApiBaseUrl(),

  // Request timeout in milliseconds (default 10 seconds for LAN/WiFi resilience)
  API_TIMEOUT_MS: Number(import.meta.env.VITE_API_TIMEOUT_MS) || 10000,

  // Application metadata
  APP_TITLE: import.meta.env.VITE_APP_TITLE || 'G H Raisoni Hostel Management System',
  INSTITUTION_NAME: 'G H Raisoni Institute of Engineering & Business Management, Jalgaon',
  ACADEMIC_SESSION: '2025 – 2026',

  // Build mode flags
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
};

export default ENV;
