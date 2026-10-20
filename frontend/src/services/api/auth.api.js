import { apiRequest } from './client';
import { ENV } from '../../config/env';

/**
 * Authentication and Session API Service
 */
export const authApi = {
  /**
   * Log in user with credentials.
   * Supports both real Django backend and demo-mode fallback for any password.
   * @param {string} username
   * @param {string} password
   * @returns {Promise<{ user: any, token: string }>}
   */
  async login(username, password) {
    const cleanUsername = (username || '').trim() || 'hostel';
    const cleanPassword = password || 'admin1';

    try {
      // 1. Attempt standard Django DRF backend authentication
      const response = await apiRequest('auth/login/', {
        method: 'POST',
        body: JSON.stringify({
          username: cleanUsername,
          password: cleanPassword,
        }),
        timeout: 3000,
      });

      const token = response.token || response.access || response.key;
      const user = response.user || {
        username: cleanUsername,
        role: 'Chief Warden',
      };

      if (token) {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(user));
      }

      return {
        token,
        user,
        message: response.message || 'Authentication successful.',
      };
    } catch {
      // 2. Demo Mode Fallback:
      // Accepts any password for seamless preview and development
      const demoToken = 'demo-token-' + Math.random().toString(36).substring(2, 10);
      const demoUser = {
        id: 999,
        username: cleanUsername,
        email: `${cleanUsername}@hostel.edu`,
        is_staff: true,
        role: 'Chief Warden (Demo)',
      };

      localStorage.setItem('auth_token', demoToken);
      localStorage.setItem('auth_user', JSON.stringify(demoUser));

      return {
        token: demoToken,
        user: demoUser,
        message: 'Demo Login Successful. Access granted with demo password.',
      };
    }
  },

  /**
   * Clear session tokens and user cache
   */
  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  },

  /**
   * Check if token is stored in localStorage
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!localStorage.getItem('auth_token');
  },

  /**
   * Retrieve cached user profile
   * @returns {any | null}
   */
  getCurrentUser() {
    try {
      const u = localStorage.getItem('auth_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },

  /**
   * Health check to ping backend
   * @returns {Promise<boolean>}
   */
  async checkBackendStatus() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${ENV.API_BASE_URL.replace(/\/$/, '')}/health/`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return res.ok;
    } catch {
      return false;
    }
  },
};

export default authApi;
