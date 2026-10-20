import { apiRequest, buildQueryString } from './client';

/**
 * Hostel Fees and Payments API Service
 */
export const feesApi = {
  /**
   * Get fee structures and balances
   * @param {{ search?: string, status?: string, student?: number|string }} params
   */
  async getFees(params = {}) {
    const qs = buildQueryString(params);
    return apiRequest(`fees/${qs}`);
  },

  /**
   * Generate new fee invoice
   * @param {Record<string, any>} data
   */
  async createFee(data) {
    return apiRequest('fees/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get payment history records
   * @param {{ student?: number|string, fee_record?: number|string }} params
   */
  async getPayments(params = {}) {
    const qs = buildQueryString(params);
    return apiRequest(`payments/${qs}`);
  },

  /**
   * Record fee collection payment
   * @param {Record<string, any>} data
   */
  async recordPayment(data) {
    return apiRequest('payments/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

export default feesApi;
