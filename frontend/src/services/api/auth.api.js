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
  async login(username, password, role = 'admin') {
    const cleanUsername = (username || '').trim() || (role === 'student' ? 'HST-2026-001' : 'hostel');
    const cleanPassword = password || 'demo';

    try {
      // 1. Attempt standard Django DRF backend authentication
      const response = await apiRequest('auth/login/', {
        method: 'POST',
        body: JSON.stringify({
          username: cleanUsername,
          password: cleanPassword,
          role: role,
        }),
        timeout: 4000,
      });

      const token = response.token || response.access || response.key;
      const user = response.user ? {
        ...response.user,
        role: response.role || (role === 'student' ? 'student' : 'admin'),
        student: response.student || null,
      } : {
        username: cleanUsername,
        role: role === 'student' ? 'student' : 'Chief Warden',
      };

      if (token) {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(user));
        localStorage.setItem('user_role', user.role);
        if (response.student) {
          localStorage.setItem('student_profile', JSON.stringify(response.student));
        }
      }

      return {
        token,
        user,
        student: response.student,
        message: response.message || 'Authentication successful.',
      };
    } catch {
      // 2. Demo Mode Fallback:
      const isStudent = role === 'student' || cleanUsername.toUpperCase().startsWith('HST-');
      const demoToken = 'demo-token-' + Math.random().toString(36).substring(2, 10);
      const demoUser = isStudent ? {
        id: 1,
        username: cleanUsername,
        email: `${cleanUsername.toLowerCase()}@student.ghr.edu`,
        is_staff: false,
        role: 'student',
        student: {
          id: 1,
          student_id: cleanUsername.toUpperCase().startsWith('HST-') ? cleanUsername.toUpperCase() : 'HST-2026-001',
          full_name: 'Aarav Sharma',
          course: 'B.Tech Computer Science & Eng.',
          year_of_study: '3rd Year',
          current_room: '101',
          current_bed: 'Bed-1',
          block_name: 'Block A (Main Hostel)',
          status: 'active'
        }
      } : {
        id: 999,
        username: cleanUsername,
        email: `${cleanUsername}@hostel.edu`,
        is_staff: true,
        role: 'admin',
      };

      localStorage.setItem('auth_token', demoToken);
      localStorage.setItem('auth_user', JSON.stringify(demoUser));
      localStorage.setItem('user_role', demoUser.role);
      if (demoUser.student) {
        localStorage.setItem('student_profile', JSON.stringify(demoUser.student));
      }

      return {
        token: demoToken,
        user: demoUser,
        student: demoUser.student,
        message: 'Demo Login Successful. Access granted with demo password.',
      };
    }
  },

  /**
   * Dedicated Student Login
   * @param {string} studentId e.g. HST-2026-001
   * @param {string} password
   */
  async studentLogin(studentId, password = 'demo') {
    return this.login(studentId, password, 'student');
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
