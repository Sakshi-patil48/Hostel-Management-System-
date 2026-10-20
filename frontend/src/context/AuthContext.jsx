import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

/**
 * @typedef {Object} UserProfile
 * @property {number|string} [id]
 * @property {string} username
 * @property {string} [email]
 * @property {string} [role]
 * @property {boolean} [is_staff]
 */

/**
 * @typedef {Object} AuthContextValue
 * @property {UserProfile|null} user
 * @property {boolean} isAuthenticated
 * @property {boolean} loading
 * @property {(username: string, password: string) => Promise<any>} login
 * @property {() => void} logout
 * @property {(updated: Partial<UserProfile>) => void} updateProfile
 */

const AuthContext = createContext(/** @type {AuthContextValue|null} */ (null));

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cachedUser = authService.getCurrentUser();
    setUser(cachedUser);
    setLoading(false);
  }, []);

  const login = useCallback(async (username, password, role = 'admin') => {
    const res = await authService.login(username, password, role);
    if (res.user) {
      setUser(res.user);
    }
    return res;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const updateProfile = useCallback((updated) => {
    setUser((prev) => {
      const merged = { ...(prev || {}), ...updated };
      localStorage.setItem('auth_user', JSON.stringify(merged));
      return merged;
    });
  }, []);

  const value = {
    user: user || { username: 'hostel', role: 'Chief Warden', email: 'admin@hostel.edu' },
    isAuthenticated: !!user || authService.isAuthenticated(),
    loading,
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
