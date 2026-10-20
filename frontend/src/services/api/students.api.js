import { apiRequest, buildQueryString } from './client';

/**
 * Student Directory and Admissions API Service
 */
export const studentsApi = {
  /**
   * Get students with search, status, and course filters
   * @param {{ search?: string, status?: string, course?: string }} params
   */
  async getStudents(params = {}) {
    const qs = buildQueryString(params);
    return apiRequest(`students/${qs}`);
  },

  /**
   * Get student details by ID
   * @param {number|string} id
   */
  async getStudent(id) {
    return apiRequest(`students/${id}/`);
  },

  /**
   * Register a new student
   * @param {Record<string, any>} data
   */
  async createStudent(data) {
    return apiRequest('students/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update student profile
   * @param {number|string} id
   * @param {Record<string, any>} data
   */
  async updateStudent(id, data) {
    return apiRequest(`students/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete student record
   * @param {number|string} id
   */
  async deleteStudent(id) {
    return apiRequest(`students/${id}/`, {
      method: 'DELETE',
    });
  },
};

export default studentsApi;
