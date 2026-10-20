import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import ConfirmModal from './ConfirmModal';
import ghrLogo from '../assets/ghr_logo.png';
import '../dashboard.css';
import {
  Home, Building2, Users, Wallet,
  ClipboardCheck, Briefcase, BarChart3, Settings,
  LogOut, XCircle, Menu, X, ChevronRight,
  UserPlus, UserMinus, KeyRound, CreditCard,
  History, CalendarCheck, AlertOctagon, Bell,
  DollarSign
} from 'lucide-react';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  // Expandable group state
  const [expandedGroups, setExpandedGroups] = useState({
    accommodation: false,
    students: false,
    finance: false,
    operations: false,
    staff: false,
    reports: false,
    settings: false,
  });

  useEffect(() => {
    const user = authService.getCurrentUser() || { username: 'hostel', role: 'Chief Warden' };
    setCurrentUser(user);
  }, []);

  // Navigation schema organized into groups inspired by Reference Image 1
  const navGroups = [
    {
      type: 'link',
      path: '/dashboard',
      label: 'Dashboard',
      icon: Home,
      exact: true,
    },
    {
      type: 'group',
      id: 'accommodation',
      label: 'Accommodation',
      icon: Building2,
      children: [
        { path: '/dashboard/rooms', label: 'Manage Rooms', icon: Building2 },
        { path: '/dashboard/allocation', label: 'Room Allocation', icon: KeyRound },
      ],
    },
    {
      type: 'group',
      id: 'students',
      label: 'Students',
      icon: Users,
      children: [
        { path: '/dashboard/students', label: 'Student Directory', icon: Users },
        { path: '/dashboard/new-student', label: 'Register New Student', icon: UserPlus },
        { path: '/dashboard/leaved-students', label: 'Leaved Students', icon: UserMinus },
      ],
    },
    {
      type: 'group',
      id: 'finance',
      label: 'Finance',
      icon: Wallet,
      children: [
        { path: '/dashboard/fees', label: 'Student Fees', icon: CreditCard },
        { path: '/dashboard/payments', label: 'Payment History', icon: History },
      ],
    },
    {
      type: 'group',
      id: 'operations',
      label: 'Operations',
      icon: ClipboardCheck,
      children: [
        { path: '/dashboard/attendance', label: 'Daily Attendance', icon: CalendarCheck },
        { path: '/dashboard/complaints', label: 'Complaints & Maintenance', icon: AlertOctagon },
        { path: '/dashboard/notices', label: 'Notices & Circulars', icon: Bell },
      ],
    },
    {
      type: 'group',
      id: 'staff',
      label: 'Staff & Payroll',
      icon: Briefcase,
      children: [
        { path: '/dashboard/employees', label: 'Staff Directory', icon: Briefcase },
        { path: '/dashboard/employee-payments', label: 'Employee Payroll', icon: DollarSign },
      ],
    },
    {
      type: 'group',
      id: 'reports',
      label: 'Reports & Analytics',
      icon: BarChart3,
      children: [
        { path: '/dashboard/reports', label: 'Analytics & Reports', icon: BarChart3 },
      ],
    },
    {
      type: 'group',
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      children: [
        { path: '/dashboard/settings', label: 'System & Profile Settings', icon: Settings },
      ],
    },
  ];

  // Auto-expand group containing the active path
  useEffect(() => {
    const currentPath = location.pathname;
    navGroups.forEach((item) => {
      if (item.type === 'group' && item.children) {
        const hasActiveChild = item.children.some((child) => child.path === currentPath);
        if (hasActiveChild) {
          setExpandedGroups((prev) => ({ ...prev, [item.id]: true }));
        }
      }
    });
  }, [location.pathname]);

  const toggleGroup = (groupId) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  const handleExit = () => {
    authService.logout();
    navigate('/');
  };

  return (
    <div className="dashboard-app-container">
      {/* Full-Viewport Campus Background Layer with Lavender-White Translucent Overlay */}
      <div className="dashboard-campus-bg" aria-hidden="true">
        <img
          src="/assets/campus_bg.jpg"
          alt="GH Raisoni College Campus"
          className="campus-bg-image"
        />
        <div className="campus-bg-overlay" />
      </div>

      {/* MAIN TOP NAVIGATION BAR (Clean light white/lavender style) */}
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
            <span className="user-avatar-badge">
              {currentUser?.username?.charAt(0).toUpperCase() || 'A'}
            </span>
            <span className="user-username">{currentUser?.username || 'Admin'}</span>
          </div>

          {/* Top-Right Logout Button */}
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

          {/* Top-Right Exit Button */}
          <button
            onClick={() => setShowExitModal(true)}
            className="btn-navigator-exit"
            title="Exit System"
          >
            <div className="btn-icon-exit-orb">
              <XCircle size={17} />
            </div>
            <span>Exit</span>
          </button>
        </div>
      </header>

      {/* MAIN LAYOUT: Light Lavender Sidebar + Content Area */}
      <div className="dashboard-body-layout">
        {/* LIGHT LAVENDER-AND-WHITE SIDEBAR */}
        <aside className={`dashboard-sidebar-panel ${mobileMenuOpen ? 'open' : ''}`}>
          {/* Sidebar Top Branding Header */}
          <div className="sidebar-brand-header">
            <div className="sidebar-brand-logo-wrap">
              <img
                src={ghrLogo || "/assets/ghr_logo.png"}
                alt="G H Raisoni Official Logo"
                className="sidebar-brand-logo-img"
              />
            </div>
            <div className="sidebar-brand-text">
              <span className="sidebar-brand-primary">GH RAISONI</span>
              <span className="sidebar-brand-secondary">HOSTEL MANAGEMENT</span>
            </div>
          </div>

          {/* Navigation Menu List */}
          <div className="sidebar-inner-nav">
            <nav className="sidebar-menu-list">
              {navGroups.map((item) => {
                const IconComponent = item.icon;

                if (item.type === 'link') {
                  const isActive = location.pathname === item.path;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end
                      onClick={() => setMobileMenuOpen(false)}
                      className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                    >
                      <span className="nav-item-icon">
                        <IconComponent size={19} />
                      </span>
                      <span className="nav-item-text">{item.label}</span>
                    </NavLink>
                  );
                }

                // Expandable Group
                const isExpanded = !!expandedGroups[item.id];
                const hasActiveChild = item.children?.some(
                  (child) => location.pathname === child.path
                );

                return (
                  <div key={item.id} className="sidebar-group-wrapper">
                    <button
                      type="button"
                      onClick={() => toggleGroup(item.id)}
                      className={`sidebar-group-header ${hasActiveChild ? 'has-active-child' : ''}`}
                      aria-expanded={isExpanded}
                    >
                      <div className="sidebar-group-header-left">
                        <span className="nav-item-icon">
                          <IconComponent size={19} />
                        </span>
                        <span className="nav-item-text">{item.label}</span>
                      </div>
                      <ChevronRight
                        size={16}
                        className={`sidebar-group-chevron ${isExpanded ? 'rotated' : ''}`}
                      />
                    </button>

                    {/* Submenu Children */}
                    {isExpanded && (
                      <div className="sidebar-submenu-list">
                        {item.children.map((child) => {
                          const isChildActive = location.pathname === child.path;
                          return (
                            <NavLink
                              key={child.path}
                              to={child.path}
                              onClick={() => setMobileMenuOpen(false)}
                              className={`sidebar-subnav-item ${isChildActive ? 'active' : ''}`}
                            >
                              <span className="subnav-indicator-dot" />
                              <span className="subnav-item-text">{child.label}</span>
                            </NavLink>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Subtle Campus Watermark Footer (Clean, Non-Boxed) */}
          <div className="sidebar-bottom-watermark">
            <div className="sidebar-bottom-badge">
              <span className="sidebar-bottom-campus">GH RAISONI COLLEGE</span>
              <span className="sidebar-bottom-city">JALGAON CAMPUS</span>
            </div>
          </div>
        </aside>

        {/* Mobile Backdrop */}
        {mobileMenuOpen && (
          <div
            className="mobile-backdrop"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
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
        message="Are you sure you want to log out of the Hostel Management System? You will be redirected to the Login Page."
        confirmText="Yes, Logout"
      />

      {/* Exit Confirmation Modal */}
      <ConfirmModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        onConfirm={handleExit}
        isDanger={true}
        title="Exit Hostel Management System"
        message="Are you sure you want to exit the application? Your session will be safely closed."
        confirmText="Exit Application"
      />
    </div>
  );
}
