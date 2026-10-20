import { apiRequest } from './client';

/**
 * Hostel Dashboard Overview & Statistics API Service
 */
export const dashboardApi = {
  /**
   * Fetch consolidated live metrics, alerts, recent notices, and pending complaints
   * @returns {Promise<any>}
   */
  async getDashboardSummary() {
    return apiRequest('dashboard/summary/');
  },
};

export default dashboardApi;
