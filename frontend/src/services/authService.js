/**
 * Centralized Authentication Service (Backward-Compatible Facade)
 * Delegates to modular authApi under services/api/auth.api.js
 */
import { authApi } from './api/auth.api';

export const authService = {
  login: (username, password, role = 'admin') => authApi.login(username, password, role),
  studentLogin: (studentId, password) => authApi.studentLogin(studentId, password),
  logout: () => authApi.logout(),
  isAuthenticated: () => authApi.isAuthenticated(),
  getCurrentUser: () => authApi.getCurrentUser(),
  checkBackendStatus: () => authApi.checkBackendStatus(),
};

export default authService;
