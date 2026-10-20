/**
 * Application Environment Configuration
 * Centralizes all environment variables and configuration constants.
 * Single source of truth across the application.
 */

export const ENV = {
  // Django REST Framework Base API URL
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',

  // Request timeout in milliseconds (default 8 seconds)
  API_TIMEOUT_MS: Number(import.meta.env.VITE_API_TIMEOUT_MS) || 8000,

  // Application metadata
  APP_TITLE: import.meta.env.VITE_APP_TITLE || 'G H Raisoni Hostel Management System',
  INSTITUTION_NAME: 'G H Raisoni Institute of Engineering & Business Management, Jalgaon',
  ACADEMIC_SESSION: '2025 – 2026',

  // Build mode flags
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
};

export default ENV;
