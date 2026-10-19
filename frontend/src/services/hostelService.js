import { apiRequest, API_BASE_URL } from './api';

/**
 * Hostel Management Service
 * Comprehensive API client for all Hostel Management System modules
 */
export const hostelService = {
  // 1. Dashboard Summary
  async getDashboardSummary() {
    return apiRequest('dashboard/summary/');
  },

  // 2. Blocks, Rooms & Beds
  async getBlocks() {
    return apiRequest('blocks/');
  },

  async getRooms(params = {}) {
    const cleanParams = {};
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '' && val !== 'undefined' && val !== 'null') {
        cleanParams[key] = val;
      }
    });
    const query = new URLSearchParams(cleanParams).toString();
    return apiRequest(`rooms/${query ? '?' + query : ''}`);
  },

  async createRoom(data) {
    return apiRequest('rooms/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateRoom(id, data) {
    return apiRequest(`rooms/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteRoom(id) {
    return apiRequest(`rooms/${id}/`, {
      method: 'DELETE',
    });
  },

  async getBeds(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`beds/${query ? '?' + query : ''}`);
  },

  // 3. Students
  async getStudents(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`students/${query ? '?' + query : ''}`);
  },

  async getStudent(id) {
    return apiRequest(`students/${id}/`);
  },

  async createStudent(data) {
    return apiRequest('students/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateStudent(id, data) {
    return apiRequest(`students/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteStudent(id) {
    return apiRequest(`students/${id}/`, {
      method: 'DELETE',
    });
  },

  // 4. Room Allocation
  async getAllocations(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`allocations/${query ? '?' + query : ''}`);
  },

  async createAllocation(data) {
    return apiRequest('allocations/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async checkoutAllocation(id) {
    return apiRequest(`allocations/${id}/checkout/`, {
      method: 'POST',
    });
  },

  // 5. Fees & Payments
  async getFees(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`fees/${query ? '?' + query : ''}`);
  },

  async createFee(data) {
    return apiRequest('fees/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getPayments(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`payments/${query ? '?' + query : ''}`);
  },

  async recordPayment(data) {
    return apiRequest('payments/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 6. Attendance
  async getAttendance(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`attendance/${query ? '?' + query : ''}`);
  },

  async markAttendanceBulk(records, date, marked_by = 'Hostel Warden') {
    return apiRequest('attendance/bulk_mark/', {
      method: 'POST',
      body: JSON.stringify({ records, date, marked_by }),
    });
  },

  // 7. Complaints
  async getComplaints(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`complaints/${query ? '?' + query : ''}`);
  },

  async createComplaint(data) {
    return apiRequest('complaints/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateComplaint(id, data) {
    return apiRequest(`complaints/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // 8. Notices
  async getNotices(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`notices/${query ? '?' + query : ''}`);
  },

  async createNotice(data) {
    return apiRequest('notices/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateNotice(id, data) {
    return apiRequest(`notices/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deleteNotice(id) {
    return apiRequest(`notices/${id}/`, {
      method: 'DELETE',
    });
  },

  // 9. Employees & Salaries
  async getEmployees(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`employees/${query ? '?' + query : ''}`);
  },

  async createEmployee(data) {
    return apiRequest('employees/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateEmployee(id, data) {
    return apiRequest(`employees/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteEmployee(id) {
    return apiRequest(`employees/${id}/`, {
      method: 'DELETE',
    });
  },

  async getEmployeePayments(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`employee-payments/${query ? '?' + query : ''}`);
  },

  async recordEmployeePayment(data) {
    return apiRequest('employee-payments/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 10. Reports CSV Export URL
  getReportExportUrl(reportType) {
    return `${API_BASE_URL.replace(/\/$/, '')}/reports/export/${reportType}/`;
  },
};
