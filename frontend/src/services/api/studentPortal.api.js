import { apiRequest } from './client';

/**
 * Student Attendance Portal API Service
 * Dedicated client for student self-service attendance, QR check-in, and stats
 */
export const studentPortalApi = {
  /**
   * Get verified student profile with assigned room, bed, and block
   * @param {string} [studentId] - Optional student ID for preview / staff simulation
   */
  async getProfile(studentId) {
    const query = studentId ? `?student_id=${encodeURIComponent(studentId)}` : '';
    return apiRequest(`student-portal/profile/${query}`);
  },

  /**
   * Get student's monthly attendance statistics, today's status, and full history
   * @param {string} [studentId] - Optional student ID for preview / staff simulation
   */
  async getAttendanceHistory(studentId) {
    const query = studentId ? `?student_id=${encodeURIComponent(studentId)}` : '';
    return apiRequest(`student-portal/attendance/${query}`);
  },

  /**
   * Mark attendance via QR token or 6-digit session PIN
   * @param {{
   *   session_token?: string,
   *   session_code?: string,
   *   method?: 'qr_code' | 'session_code' | 'face_verified',
   *   student_id?: string,
   *   device_info?: string
   * }} payload
   */
  async checkIn(payload = {}) {
    return apiRequest('student-portal/check-in/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

export default studentPortalApi;
