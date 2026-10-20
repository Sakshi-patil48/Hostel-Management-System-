/**
 * Centralized API client configuration (Backward-Compatible Facade)
 * Delegates to modular client under services/api/
 */
import { ENV } from '../config/env';
import { apiRequest as clientRequest, ApiError, parseDrfErrorMessage } from './api/client';

export const API_BASE_URL = ENV.API_BASE_URL;
export { ApiError, parseDrfErrorMessage };

/**
 * Standard HTTP request wrapper with proper headers, timeout, and error handling
 */
export async function apiRequest(endpoint, options = {}) {
  return clientRequest(endpoint, options);
}

// Re-export all domain APIs for convenience
export * from './api/index';

export default apiRequest;
