import { apiRequest, API_BASE_URL } from './api';

/**
 * Centralized Authentication Service with Demo Mode & Django Backend Support
 * Accepts ANY demo password as requested, while still supporting real Django DRF if available.
 */
export const authService = {
  /**
   * Attempt user login with credentials.
   * Accepts any demo password and ensures seamless entry to the dashboard.
   * @param {string} username
   * @param {string} password
   * @returns {Promise<{ user: any, token: string }>}
   */
  async login(username, password) {
    const cleanUsername = (username || '').trim() || 'hostel';
    const cleanPassword = password || 'admin1';

    try {
      // 1. Try real Django backend first if available
      const response = await apiRequest('auth/login/', {
        method: 'POST',
        body: JSON.stringify({
          username: cleanUsername,
          password: cleanPassword,
        }),
        timeout: 2500, // Quick timeout for seamless demo fallback
      });

      const token = response.token || response.access || response.key;
      if (token) {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(response.user || { username: cleanUsername }));
      }
      return response;
    } catch (err) {
      // 2. Demo Mode Fallback:
      // Per user requirement: "i should be open in any demo password."
      // If backend is not available or rejected credentials, allow demo access with any password!
      const demoToken = 'demo-token-' + Math.random().toString(36).substring(2, 10);
      const demoUser = {
        id: 999,
        username: cleanUsername,
        email: `${cleanUsername}@hostel.edu`,
        is_staff: true,
        role: 'Administrator (Demo)',
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
   * Log out user and clear stored tokens
   */
  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  },

  /**
   * Check if a valid token is present
   */
  isAuthenticated() {
    return !!localStorage.getItem('auth_token');
  },

  /**
   * Get current stored user profile
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
   * Lightweight health check to see if the Django backend is currently running
   */
  async checkBackendStatus() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/health/`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return res.ok;
    } catch {
      return false;
    }
  },
};
