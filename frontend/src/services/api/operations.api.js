import { apiRequest, buildQueryString } from './client';

/**
 * Hostel Daily Operations (Attendance and Complaints) API Service
 */
export const operationsApi = {
  // --- Attendance ---
  /**
   * Get attendance records
   * @param {{ date?: string, student?: number|string, status?: string }} params
   */
  async getAttendance(params = {}) {
    const qs = buildQueryString(params);
    return apiRequest(`attendance/${qs}`);
  },

  /**
   * Bulk mark daily attendance
   * @param {Array<{ student_id: number|string, status: string, remarks?: string }>} records
   * @param {string} date - 'YYYY-MM-DD'
   * @param {string} markedBy
   */
  async markAttendanceBulk(records, date, markedBy = 'Hostel Warden') {
    return apiRequest('attendance/bulk_mark/', {
      method: 'POST',
      body: JSON.stringify({
        records,
        date,
        marked_by: markedBy,
      }),
    });
  },

  // --- Complaints ---
  /**
   * Get maintenance and student complaints
   * @param {{ search?: string, status?: string, complaint_type?: string }} params
   */
  async getComplaints(params = {}) {
    const qs = buildQueryString(params);
    return apiRequest(`complaints/${qs}`);
  },

  /**
   * Submit new complaint
   * @param {Record<string, any>} data
   */
  async createComplaint(data) {
    return apiRequest('complaints/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update complaint status or details
   * @param {number|string} id
   * @param {Record<string, any>} data
   */
  async updateComplaint(id, data) {
    return apiRequest(`complaints/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};

export default operationsApi;
