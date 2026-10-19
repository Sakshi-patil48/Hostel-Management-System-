import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import ConfirmModal from './ConfirmModal';
import {
  Home, Building2, UserPlus, Users, KeyRound,
  CreditCard, History, UserMinus, CalendarCheck,
  AlertOctagon, Bell, Briefcase, DollarSign,
  BarChart3, Settings, LogOut, XCircle, Menu, X, Sparkles
} from 'lucide-react';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  useEffect(() => {
    const user = authService.getCurrentUser() || { username: 'hostel', role: 'Chief Warden' };
    setCurrentUser(user);
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  const handleExit = () => {
    // Graceful exit: clear session and return to login screen
    authService.logout();
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home, exact: true },
    { path: '/dashboard/rooms', label: 'Manage Room', icon: Building2 },
    { path: '/dashboard/new-student', label: 'New Student', icon: UserPlus },
    { path: '/dashboard/students', label: 'Update & Delete Students', icon: Users },
    { path: '/dashboard/allocation', label: 'Room Allocation', icon: KeyRound },
    { path: '/dashboard/fees', label: 'Student Fees', icon: CreditCard },
    { path: '/dashboard/payments', label: 'All Student Living', icon: History },
    { path: '/dashboard/leaved-students', label: 'Leaved Students', icon: UserMinus },
    { path: '/dashboard/attendance', label: 'Student Attendance', icon: CalendarCheck },
    { path: '/dashboard/complaints', label: 'Complaints & Maintenance', icon: AlertOctagon },
    { path: '/dashboard/notices', label: 'Notices & Announcements', icon: Bell },
    { path: '/dashboard/employees', label: 'New Employee & Staff', icon: Briefcase },
    { path: '/dashboard/employee-payments', label: 'Employee Payment', icon: DollarSign },
    { path: '/dashboard/reports', label: 'Reports & Analytics', icon: BarChart3 },
    { path: '/dashboard/settings', label: 'Profile & Settings', icon: Settings },
  ];

  return (
    <div className="dashboard-app-container">
      {/* 3D Campus Background Layer with Glass Overlay */}
      <div className="dashboard-campus-bg">
        <img src="/assets/campus_bg.jpg" alt="Hostel Campus" className="dashboard-bg-img" />
        <div className="dashboard-ambient-lighting" />
      </div>

      {/* TOP HEADER: Stylized NAVIGATOR BAR matching Screenshot 2 */}
      <header className="navigator-top-bar">
        <div className="nav-bar-left">
          <button
            className="mobile-hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Drawer"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          
          <div className="navigator-title-group">
            <h1 className="navigator-brand-title">G H RAISONI HOSTEL</h1>
          </div>
        </div>

        <div className="nav-bar-right">
          {/* User Profile Badge */}
          <div className="nav-user-pill">
            <span className="user-avatar-badge">{currentUser?.username?.charAt(0).toUpperCase() || 'A'}</span>
            <span className="user-username">{currentUser?.username || 'Admin'}</span>
          </div>

          {/* Top-Right Logout Button matching Screenshot 2 */}
          <button
            onClick={() => setShowLogoutModal(true)}
            className="btn-navigator-logout"
            title="Log out of Hostel Management System"
          >
            <div className="btn-icon-door">
              <LogOut size={16} />
            </div>
            <span>Logout</span>
          </button>

          {/* Top-Right Red 3D Exit Button matching Screenshot 2 */}
          <button
            onClick={() => setShowExitModal(true)}
            className="btn-navigator-exit"
            title="Exit System"
          >
            <div className="btn-icon-exit-orb">
              <XCircle size={18} />
            </div>
            <span>Exit</span>
          </button>
        </div>
      </header>

      {/* MAIN LAYOUT: Sidebar + Content */}
      <div className="dashboard-body-layout">
        {/* LEFT PASTEL-PINK SIDEBAR matching Screenshot 2 */}
        <aside className={`dashboard-sidebar-panel ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="sidebar-inner-nav">
            <div className="sidebar-menu-list">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = item.exact
                  ? location.pathname === item.path
                  : location.pathname === item.path || location.pathname.startsWith(item.path + '/');

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.exact}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive: linkActive }) =>
                      `sidebar-nav-btn ${linkActive || isActive ? 'active' : ''}`
                    }
                  >
                    <span className="nav-btn-icon">
                      <IconComponent size={17} />
                    </span>
                    <span className="nav-btn-text">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Mobile backdrop */}
        {mobileMenuOpen && (
          <div
            className="mobile-backdrop"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* MAIN CONTENT AREA */}
        <main className="dashboard-main-content">
          <div className="content-inner-scroll">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Sign Out"
        message="Are you sure you want to log out of the Hostel Management System? You will be redirected to the 3D Login Page."
        confirmText="Yes, Logout"
      />

      {/* Exit Confirmation Modal */}
      <ConfirmModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        onConfirm={handleExit}
        isDanger={true}
        title="Exit Hostel Management System"
        message="Are you sure you want to exit the application? Your session will be safely closed and returned to the home screen."
        confirmText="Exit Application"
      />
    </div>
  );
}
