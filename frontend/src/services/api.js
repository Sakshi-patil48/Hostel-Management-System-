/**
 * Centralized API client configuration
 * Uses VITE_API_BASE_URL with fallback to local Django DRF server
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

/**
 * Standard HTTP request wrapper with proper headers, timeout, and error handling
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers || {}),
  };

  const token = localStorage.getItem('auth_token');
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout || 8000);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      let errorMessage = 'Request failed';
      if (typeof data === 'object' && data !== null) {
        if (data.detail) {
          errorMessage = data.detail;
        } else if (data.error) {
          errorMessage = data.error;
        } else if (data.message) {
          errorMessage = data.message;
        } else {
          errorMessage = Object.entries(data)
            .map(([field, errs]) => `${field.replace(/_/g, ' ')}: ${Array.isArray(errs) ? errs.join(', ') : errs}`)
            .join(' | ');
        }
      } else if (typeof data === 'string' && data.length > 0) {
        errorMessage = data;
      }
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      const timeoutError = new Error('Connection timed out. Backend server is not responding.');
      timeoutError.isNetworkError = true;
      throw timeoutError;
    }
    if (err instanceof TypeError && err.message.includes('fetch')) {
      const netError = new Error('Backend server is currently unreachable. Make sure Django is running at ' + API_BASE_URL);
      netError.isNetworkError = true;
      throw netError;
    }
    throw err;
  }
}
