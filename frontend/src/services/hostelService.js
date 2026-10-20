/**
 * Hostel Management Service (Backward-Compatible Facade)
 * Aggregates and delegates to modular domain API clients in services/api/
 */
import {
  dashboardApi,
  roomsApi,
  studentsApi,
  allocationsApi,
  feesApi,
  operationsApi,
  noticesApi,
  staffApi,
  reportsApi,
} from './api/index';

export const hostelService = {
  // 1. Dashboard
  getDashboardSummary: () => dashboardApi.getDashboardSummary(),

  // 2. Rooms, Blocks & Beds
  getBlocks: () => roomsApi.getBlocks(),
  getRooms: (params) => roomsApi.getRooms(params),
  getRoom: (id) => roomsApi.getRoom(id),
  createRoom: (data) => roomsApi.createRoom(data),
  updateRoom: (id, data) => roomsApi.updateRoom(id, data),
  deleteRoom: (id) => roomsApi.deleteRoom(id),
  getBeds: (params) => roomsApi.getBeds(params),

  // 3. Students
  getStudents: (params) => studentsApi.getStudents(params),
  getStudent: (id) => studentsApi.getStudent(id),
  createStudent: (data) => studentsApi.createStudent(data),
  updateStudent: (id, data) => studentsApi.updateStudent(id, data),
  deleteStudent: (id) => studentsApi.deleteStudent(id),

  // 4. Allocations
  getAllocations: (params) => allocationsApi.getAllocations(params),
  createAllocation: (data) => allocationsApi.createAllocation(data),
  checkoutAllocation: (id) => allocationsApi.checkoutAllocation(id),

  // 5. Fees & Payments
  getFees: (params) => feesApi.getFees(params),
  createFee: (data) => feesApi.createFee(data),
  getPayments: (params) => feesApi.getPayments(params),
  recordPayment: (data) => feesApi.recordPayment(data),

  // 6. Attendance & Complaints
  getAttendance: (params) => operationsApi.getAttendance(params),
  markAttendanceBulk: (records, date, markedBy) =>
    operationsApi.markAttendanceBulk(records, date, markedBy),
  getComplaints: (params) => operationsApi.getComplaints(params),
  createComplaint: (data) => operationsApi.createComplaint(data),
  updateComplaint: (id, data) => operationsApi.updateComplaint(id, data),

  // 7. Notices
  getNotices: (params) => noticesApi.getNotices(params),
  createNotice: (data) => noticesApi.createNotice(data),
  updateNotice: (id, data) => noticesApi.updateNotice(id, data),
  deleteNotice: (id) => noticesApi.deleteNotice(id),

  // 8. Staff & Payroll
  getEmployees: (params) => staffApi.getEmployees(params),
  createEmployee: (data) => staffApi.createEmployee(data),
  updateEmployee: (id, data) => staffApi.updateEmployee(id, data),
  deleteEmployee: (id) => staffApi.deleteEmployee(id),
  getEmployeePayments: (params) => staffApi.getEmployeePayments(params),
  recordEmployeePayment: (data) => staffApi.recordEmployeePayment(data),

  // 9. Reports Export
  getReportExportUrl: (reportType) => reportsApi.getReportExportUrl(reportType),
};

export default hostelService;
