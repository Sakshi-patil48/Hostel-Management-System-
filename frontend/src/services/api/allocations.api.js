import { apiRequest, buildQueryString } from './client';

/**
 * Room and Bed Allocation API Service
 */
export const allocationsApi = {
  /**
   * Get room allocations
   * @param {{ student?: number|string, room?: number|string, status?: string }} params
   */
  async getAllocations(params = {}) {
    const qs = buildQueryString(params);
    return apiRequest(`allocations/${qs}`);
  },

  /**
   * Allocate a bed to a student
   * @param {Record<string, any>} data
   */
  async createAllocation(data) {
    return apiRequest('allocations/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Checkout student and vacate bed
   * @param {number|string} id
   */
  async checkoutAllocation(id) {
    return apiRequest(`allocations/${id}/checkout/`, {
      method: 'POST',
    });
  },
};

export default allocationsApi;
