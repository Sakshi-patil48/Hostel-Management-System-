import { ENV } from '../../config/env';
import { sanitizeFormPayload } from '../../utils/security';

/**
 * Standardized API Error Class
 * Normalizes backend error responses (DRF dicts, strings, network errors, timeouts)
 */
export class ApiError extends Error {
  constructor(message, status = 0, data = null, meta = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.isNetworkError = meta.isNetworkError || false;
    this.isTimeout = meta.isTimeout || false;
  }
}

/**
 * Parse Django REST Framework error payloads into human-readable strings
 * @param {any} data
 * @param {number} status
 * @returns {string}
 */
export function parseDrfErrorMessage(data, status) {
  if (!data) {
    if (status === 404) return 'Requested resource was not found.';
    if (status === 403) return 'You do not have permission to perform this action.';
    if (status === 401) return 'Session expired or unauthenticated. Please sign in again.';
    if (status >= 500) return 'Internal server error. Please try again later.';
    return 'An unexpected error occurred.';
  }

  if (typeof data === 'string') {
    return data;
  }

  if (typeof data === 'object') {
    if (data.detail && typeof data.detail === 'string') {
      return data.detail;
    }
    if (data.error && typeof data.error === 'string') {
      return data.error;
    }
    if (data.message && typeof data.message === 'string') {
      return data.message;
    }

    // DRF field-specific validation errors: { field_name: ["Error detail", ...] }
    const fieldErrors = Object.entries(data)
      .map(([field, errs]) => {
        const fieldName = field.replace(/_/g, ' ');
        const messages = Array.isArray(errs) ? errs.join(', ') : String(errs);
        return `${fieldName}: ${messages}`;
      })
      .filter(Boolean);

    if (fieldErrors.length > 0) {
      return fieldErrors.join(' | ');
    }
  }

  return 'Request failed with status ' + status;
}

/**
 * Build URL query parameters string safely omitting null/undefined values
 * @param {Record<string, any>} params
 * @returns {string}
 */
export function buildQueryString(params = {}) {
  const cleanParams = {};
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '' && val !== 'undefined' && val !== 'null') {
      cleanParams[key] = val;
    }
  });
  const qs = new URLSearchParams(cleanParams).toString();
  return qs ? `?${qs}` : '';
}

/**
 * Core HTTP Request Wrapper
 * Injects token, handles timeouts, parses responses, and raises typed ApiErrors
 * @param {string} endpoint - Relative endpoint path (e.g. 'rooms/')
 * @param {RequestInit & { timeout?: number }} options
 * @returns {Promise<any>}
 */
export async function apiRequest(endpoint, options = {}) {
  const baseUrl = ENV.API_BASE_URL.replace(/\/$/, '');
  const cleanEndpoint = endpoint.replace(/^\//, '');
  const url = `${baseUrl}/${cleanEndpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers || {}),
  };

  const token = localStorage.getItem('auth_token');
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }

  const timeoutMs = options.timeout || ENV.API_TIMEOUT_MS;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let body = options.body;
  if (body && typeof body === 'string' && headers['Content-Type']?.includes('application/json')) {
    try {
      const parsed = JSON.parse(body);
      body = JSON.stringify(sanitizeFormPayload(parsed));
    } catch {
      // Retain original string if not valid JSON
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      body,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const errorMessage = parseDrfErrorMessage(data, response.status);
      throw new ApiError(errorMessage, response.status, data);
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);

    if (err instanceof ApiError) {
      throw err;
    }

    if (err.name === 'AbortError') {
      throw new ApiError(
        'Connection timed out. Backend server took too long to respond.',
        408,
        null,
        { isTimeout: true }
      );
    }

    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw new ApiError(
        `Backend server is unreachable. Please verify Django is running at ${ENV.API_BASE_URL}`,
        0,
        null,
        { isNetworkError: true }
      );
    }

    throw new ApiError(err.message || 'Network request failed', 0, null);
  }
}

export default apiRequest;
