import { apiRequest, buildQueryString } from './client';

/**
 * Hostel Noticeboard API Service
 */
export const noticesApi = {
  /**
   * Get noticeboard items
   * @param {{ search?: string, is_active?: boolean, notice_type?: string }} params
   */
  async getNotices(params = {}) {
    const qs = buildQueryString(params);
    return apiRequest(`notices/${qs}`);
  },

  /**
   * Post new official notice
   * @param {Record<string, any>} data
   */
  async createNotice(data) {
    return apiRequest('notices/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update existing notice
   * @param {number|string} id
   * @param {Record<string, any>} data
   */
  async updateNotice(id, data) {
    return apiRequest(`notices/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete notice
   * @param {number|string} id
   */
  async deleteNotice(id) {
    return apiRequest(`notices/${id}/`, {
      method: 'DELETE',
    });
  },
};

export default noticesApi;
