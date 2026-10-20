import { apiRequest, buildQueryString } from './client';

/**
 * Hostel Employees and Staff Payroll API Service
 */
export const staffApi = {
  /**
   * Get employee directory
   * @param {{ search?: string, designation?: string, status?: string }} params
   */
  async getEmployees(params = {}) {
    const qs = buildQueryString(params);
    return apiRequest(`employees/${qs}`);
  },

  /**
   * Register new staff member
   * @param {Record<string, any>} data
   */
  async createEmployee(data) {
    return apiRequest('employees/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update employee record
   * @param {number|string} id
   * @param {Record<string, any>} data
   */
  async updateEmployee(id, data) {
    return apiRequest(`employees/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete employee record
   * @param {number|string} id
   */
  async deleteEmployee(id) {
    return apiRequest(`employees/${id}/`, {
      method: 'DELETE',
    });
  },

  /**
   * Get staff salary and stipend payment history
   * @param {{ employee?: number|string }} params
   */
  async getEmployeePayments(params = {}) {
    const qs = buildQueryString(params);
    return apiRequest(`employee-payments/${qs}`);
  },

  /**
   * Record salary disbursement
   * @param {Record<string, any>} data
   */
  async recordEmployeePayment(data) {
    return apiRequest('employee-payments/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

export default staffApi;
