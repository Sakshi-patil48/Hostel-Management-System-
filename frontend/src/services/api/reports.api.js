import { ENV } from '../../config/env';

/**
 * Hostel Reports and CSV Data Export Service
 */
export const reportsApi = {
  /**
   * Get direct download URL for report CSV export
   * @param {'students' | 'rooms' | 'fees' | 'attendance'} reportType
   * @returns {string}
   */
  getReportExportUrl(reportType) {
    const baseUrl = ENV.API_BASE_URL.replace(/\/$/, '');
    return `${baseUrl}/reports/export/${reportType}/`;
  },
};

export default reportsApi;
