import { ENV } from '../../config/env';
import { sanitizeFormPayload } from '../../utils/security';
import { localDatabase } from '../localDatabase';

/**
 * Standardized API Error Class
 * Normalizes error responses across components
 */
export class ApiError extends Error {
  constructor(message, status = 0, data = null, meta = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.isNetworkError = meta.isNetworkError || false;
    this.isTimeout = meta.isTimeout || false;
  }
}

/**
 * Parse DRF or local error payloads into human-readable strings
 */
export function parseDrfErrorMessage(data, status) {
  if (!data) {
    if (status === 404) return 'Requested resource was not found.';
    if (status === 403) return 'You do not have permission to perform this action.';
    if (status === 401) return 'Session expired or unauthenticated. Please sign in again.';
    if (status >= 500) return 'Internal server error. Please try again later.';
    return 'An unexpected error occurred.';
  }

  if (typeof data === 'string') return data;

  if (typeof data === 'object') {
    if (data.detail && typeof data.detail === 'string') return data.detail;
    if (data.error && typeof data.error === 'string') return data.error;
    if (data.message && typeof data.message === 'string') return data.message;

    const fieldErrors = Object.entries(data)
      .map(([field, errs]) => {
        const fieldName = field.replace(/_/g, ' ');
        const messages = Array.isArray(errs) ? errs.join(', ') : String(errs);
        return `${fieldName}: ${messages}`;
      })
      .filter(Boolean);

    if (fieldErrors.length > 0) return fieldErrors.join(' | ');
  }

  return 'An error occurred during operation.';
}

/**
 * Construct URL from base and relative path
 */
export function buildApiUrl(endpoint) {
  return `localStorage://${endpoint.replace(/^\//, '')}`;
}

/**
 * Build URL search query string from object
 */
export function buildQueryString(params = {}) {
  const clean = {};
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '' && val !== 'undefined' && val !== 'null') {
      clean[key] = String(val).trim();
    }
  });
  const qs = new URLSearchParams(clean).toString();
  return qs ? `?${qs}` : '';
}

/**
 * Client-side health check - always reports operational in frontend storage mode
 */
export async function checkBackendHealth() {
  return true;
}

/**
 * Core Request Router - dispatches all API calls directly to frontend LocalDatabase
 * Allows the entire application to run standalone on ANY laptop with zero backend required!
 */
export async function apiRequest(endpoint, options = {}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const method = (options.method || 'GET').toUpperCase();
        const [rawPath, rawQuery] = endpoint.replace(/^\/?api\/?/, '').split('?');
        const path = rawPath.replace(/^\//, '').replace(/\/$/, '');

        const params = {};
        if (rawQuery) {
          new URLSearchParams(rawQuery).forEach((v, k) => {
            params[k] = v;
          });
        }

        let body = {};
        if (options.body) {
          try {
            body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
            body = sanitizeFormPayload(body);
          } catch {
            body = options.body;
          }
        }

        let result = null;

        // 1. Dashboard Summary
        if (path === 'dashboard/summary') {
          result = localDatabase.getDashboardSummary();
        }
        // 2. Blocks
        else if (path === 'blocks') {
          result = localDatabase.getBlocks();
        }
        // 3. Rooms
        else if (path === 'rooms') {
          if (method === 'GET') result = localDatabase.getRooms(params);
          else if (method === 'POST') result = localDatabase.createRoom(body);
        } else if (path.startsWith('rooms/')) {
          const id = path.split('/')[1];
          if (method === 'GET') {
            const r = localDatabase.getRooms().find(rm => rm.id === Number(id));
            if (!r) throw new Error('Room not found');
            result = r;
          } else if (method === 'PUT' || method === 'PATCH') {
            result = localDatabase.updateRoom(id, body);
          } else if (method === 'DELETE') {
            result = localDatabase.deleteRoom(id);
          }
        }
        // 4. Beds
        else if (path === 'beds') {
          result = localDatabase.getBeds(params);
        }
        // 5. Students
        else if (path === 'students') {
          if (method === 'GET') result = localDatabase.getStudents(params);
          else if (method === 'POST') result = localDatabase.createStudent(body);
        } else if (path.startsWith('students/')) {
          const id = path.split('/')[1];
          if (method === 'GET') result = localDatabase.getStudent(id);
          else if (method === 'PUT' || method === 'PATCH') result = localDatabase.updateStudent(id, body);
          else if (method === 'DELETE') result = localDatabase.deleteStudent(id);
        }
        // 6. Allocations
        else if (path === 'allocations') {
          if (method === 'GET') result = localDatabase.getAllocations(params);
          else if (method === 'POST') result = localDatabase.createAllocation(body);
        } else if (path.includes('/checkout')) {
          const id = path.split('/')[1];
          result = localDatabase.checkoutAllocation(id);
        }
        // 7. Fees
        else if (path === 'fees') {
          if (method === 'GET') result = localDatabase.getFees(params);
          else if (method === 'POST') result = localDatabase.createFee(body);
        }
        // 8. Payments
        else if (path === 'payments') {
          if (method === 'GET') result = localDatabase.getPayments(params);
          else if (method === 'POST') result = localDatabase.recordPayment(body);
        }
        // 9. Attendance
        else if (path === 'attendance/bulk_mark') {
          result = localDatabase.markAttendanceBulk(body.records, body.date, body.marked_by);
        } else if (path === 'attendance/audit') {
          result = localDatabase.getAttendanceAuditLog(params.date);
        } else if (path === 'attendance') {
          result = localDatabase.getAttendance(params);
        }
        // 10. Complaints
        else if (path === 'complaints') {
          if (method === 'GET') result = localDatabase.getComplaints(params);
          else if (method === 'POST') result = localDatabase.createComplaint(body);
        } else if (path.startsWith('complaints/')) {
          const id = path.split('/')[1];
          result = localDatabase.updateComplaint(id, body);
        }
        // 11. Notices
        else if (path === 'notices') {
          if (method === 'GET') result = localDatabase.getNotices();
          else if (method === 'POST') result = localDatabase.createNotice(body);
        } else if (path.startsWith('notices/')) {
          const id = path.split('/')[1];
          if (method === 'PUT' || method === 'PATCH') result = localDatabase.updateNotice(id, body);
          else if (method === 'DELETE') result = localDatabase.deleteNotice(id);
        }
        // 12. Employees & Payroll
        else if (path === 'employees') {
          if (method === 'GET') result = localDatabase.getEmployees(params);
          else if (method === 'POST') result = localDatabase.createEmployee(body);
        } else if (path.startsWith('employees/')) {
          const id = path.split('/')[1];
          if (method === 'PUT' || method === 'PATCH') result = localDatabase.updateEmployee(id, body);
          else if (method === 'DELETE') result = localDatabase.deleteEmployee(id);
        } else if (path === 'employee-payments') {
          if (method === 'GET') result = localDatabase.getEmployeePayments();
          else if (method === 'POST') result = localDatabase.recordEmployeePayment(body);
        }
        // 13. Attendance Sessions (Warden QR Curfew System)
        else if (path === 'attendance-sessions/active') {
          result = localDatabase.getActiveAttendanceSession();
        } else if (path.includes('/close')) {
          const id = path.split('/')[1];
          result = localDatabase.closeAttendanceSession(id);
        } else if (path === 'attendance-sessions') {
          if (method === 'GET') result = localDatabase.getAttendanceSessions();
          else if (method === 'POST') result = localDatabase.createAttendanceSession(body);
        }
        // 14. Student Attendance Portal
        else if (path === 'student-portal/profile') {
          result = localDatabase.getStudentProfile(params.student_id);
        } else if (path === 'student-portal/attendance') {
          result = localDatabase.getStudentAttendanceHistory(params.student_id);
        } else if (path === 'student-portal/check-in' || path === 'student-portal/checkin') {
          result = localDatabase.studentCheckIn(body);
        }
        // 15. Auth Login
        else if (path === 'auth/login') {
          const cleanUser = (body.username || '').trim() || 'hostel';
          const token = 'ghr-token-' + Math.random().toString(36).substring(2, 10);
          const userObj = {
            id: 1,
            username: cleanUser,
            email: `${cleanUser}@hostel.edu`,
            is_staff: true,
            role: body.role === 'student' ? 'student' : 'Chief Warden',
          };
          result = {
            token,
            access: token,
            user: userObj,
            role: userObj.role,
            message: 'Authentication successful (Standalone Frontend Mode).',
          };
        }
        // 16. Reports CSV Export
        else if (path.startsWith('reports/export/')) {
          const reportType = path.split('/')[2];
          result = localDatabase.exportCSV(reportType);
        }
        // Fallback default
        else {
          console.warn(`[LocalStore] Unhandled route: ${path}, returning empty response`);
          result = [];
        }

        resolve(result);
      } catch (err) {
        console.error(`[LocalStore Error] ${endpoint}:`, err);
        const apiErr = new ApiError(err.message || 'Operation failed', 400, { error: err.message });
        reject(apiErr);
      }
    }, 30);
  });
}

/**
 * Standard HTTP Method wrappers
 */
export const apiClient = {
  get: (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) =>
    apiRequest(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body, options = {}) =>
    apiRequest(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  patch: (endpoint, body, options = {}) =>
    apiRequest(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) }),
  delete: (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'DELETE' }),
};

export default apiClient;
