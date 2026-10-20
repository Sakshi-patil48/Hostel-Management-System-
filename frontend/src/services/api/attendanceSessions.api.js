import { apiRequest } from './client';

/**
 * Attendance Sessions API Service (Warden / QR Management)
 */
export const attendanceSessionsApi = {
  /**
   * Get list of recent attendance sessions
   */
  async getSessions() {
    return apiRequest('attendance-sessions/');
  },

  /**
   * Create a new time-limited attendance session
   * @param {{ title?: string, session_type?: string, duration_minutes?: number, created_by?: string }} data
   */
  async createSession(data = {}) {
    return apiRequest('attendance-sessions/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get the current live active session with remaining time and attendee stats
   */
  async getActiveSession() {
    return apiRequest('attendance-sessions/active/');
  },

  /**
   * Close / deactivate an active session early
   * @param {number|string} sessionId
   */
  async closeSession(sessionId) {
    return apiRequest(`attendance-sessions/${sessionId}/close/`, {
      method: 'POST',
    });
  },

  /**
   * Get today's attendance audit logs with verification method breakdown
   * @param {string} [date] - YYYY-MM-DD
   */
  async getAuditLog(date) {
    const query = date ? `?date=${date}` : '';
    return apiRequest(`attendance/audit/${query}`);
  },
};

export default attendanceSessionsApi;
