import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CampusBackground from './components/CampusBackground';
import LoginCard from './components/LoginCard';
import DashboardLayout from './components/DashboardLayout';

// Dashboard Pages
import DashboardHome from './pages/DashboardHome';
import ManageRooms from './pages/ManageRooms';
import NewStudent from './pages/NewStudent';
import ManageStudents from './pages/ManageStudents';
import RoomAllocationPage from './pages/RoomAllocationPage';
import StudentFeesPage from './pages/StudentFeesPage';
import PaymentHistoryPage from './pages/PaymentHistoryPage';
import LeavedStudentsPage from './pages/LeavedStudentsPage';
import AttendancePage from './pages/AttendancePage';
import ComplaintsPage from './pages/ComplaintsPage';
import NoticesPage from './pages/NoticesPage';
import EmployeesPage from './pages/EmployeesPage';
import EmployeePaymentsPage from './pages/EmployeePaymentsPage';
import ReportsPage from './pages/ReportsPage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';
import StudentAttendancePortal from './pages/StudentAttendancePortal';

import ProtectedRoute from './components/common/ProtectedRoute';

function LoginPage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <CampusBackground mousePos={mousePos}>
      {/* Centered Pink 3D Login Panel */}
      <LoginCard mousePos={mousePos} />
    </CampusBackground>
  );
}

export default function App() {
  const staffRoles = ['admin', 'warden', 'staff', 'Chief Warden'];

  return (
    <Routes>
      {/* Route 1: 3D Login Page */}
      <Route path="/" element={<LoginPage />} />

      {/* Route 2: Protected Working Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />

        {/* Staff/Admin-only Routes */}
        <Route
          path="rooms"
          element={
            <ProtectedRoute allowedRoles={staffRoles}>
              <ManageRooms />
            </ProtectedRoute>
          }
        />
        <Route
          path="new-student"
          element={
            <ProtectedRoute allowedRoles={staffRoles}>
              <NewStudent />
            </ProtectedRoute>
          }
        />
        <Route
          path="students"
          element={
            <ProtectedRoute allowedRoles={staffRoles}>
              <ManageStudents />
            </ProtectedRoute>
          }
        />
        <Route
          path="allocation"
          element={
            <ProtectedRoute allowedRoles={staffRoles}>
              <RoomAllocationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="fees"
          element={
            <ProtectedRoute allowedRoles={staffRoles}>
              <StudentFeesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="payments"
          element={
            <ProtectedRoute allowedRoles={staffRoles}>
              <PaymentHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="leaved-students"
          element={
            <ProtectedRoute allowedRoles={staffRoles}>
              <LeavedStudentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="employees"
          element={
            <ProtectedRoute allowedRoles={staffRoles}>
              <EmployeesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="employee-payments"
          element={
            <ProtectedRoute allowedRoles={staffRoles}>
              <EmployeePaymentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="reports"
          element={
            <ProtectedRoute allowedRoles={staffRoles}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />

        {/* Resident & Common Routes */}
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="student-attendance-portal" element={<StudentAttendancePortal />} />
        <Route path="complaints" element={<ComplaintsPage />} />
        <Route path="notices" element={<NoticesPage />} />
        <Route path="settings" element={<ProfileSettingsPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
