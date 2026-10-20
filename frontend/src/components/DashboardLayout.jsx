import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { useNotifications } from '../hooks/useNotifications';
import ConfirmModal from './ConfirmModal';
import ghrLogo from '../assets/ghr_logo.png';
import '../dashboard.css';
import {
  Home, Building2, Users, Wallet,
  ClipboardCheck, Briefcase, BarChart3, Settings,
  LogOut, Menu, X, ChevronRight,
  UserPlus, UserMinus, KeyRound, CreditCard,
  History, CalendarCheck, AlertOctagon, Bell,
  DollarSign, Sun, Moon, CheckCheck, Megaphone,
  ArrowRight, QrCode
} from 'lucide-react';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

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

  // Close notifications on outside click
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Navigation schema organized into groups
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
        { path: '/dashboard/new-student', label: 'Student Registration', icon: UserPlus },
        { path: '/dashboard/students', label: 'Student Directory', icon: Users },
        { path: '/dashboard/leaved-students', label: 'Former Students', icon: UserMinus },
        { path: '/dashboard/student-attendance-portal', label: 'Student Attendance Portal', icon: QrCode },
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

  const isStudent = currentUser?.role === 'student' || (!currentUser?.is_staff && currentUser?.student);

  // Filter navigation schema for resident students vs. staff/wardens
  const filteredNavGroups = React.useMemo(() => {
    if (!isStudent) return navGroups;

    return [
      {
        type: 'link',
        path: '/dashboard',
        label: 'Dashboard',
        icon: Home,
        exact: true,
      },
      {
        type: 'group',
        id: 'students',
        label: 'Resident Portal',
        icon: Users,
        children: [
          { path: '/dashboard/student-attendance-portal', label: 'Attendance Check-In', icon: QrCode },
          { path: '/dashboard/attendance', label: 'Attendance Calendar', icon: CalendarCheck },
        ],
      },
      {
        type: 'group',
        id: 'finance',
        label: 'My Fees & Payments',
        icon: Wallet,
        children: [
          { path: '/dashboard/fees', label: 'Fee Summary', icon: CreditCard },
          { path: '/dashboard/payments', label: 'Payment Receipts', icon: History },
        ],
      },
      {
        type: 'group',
        id: 'operations',
        label: 'Support & Circulars',
        icon: ClipboardCheck,
        children: [
          { path: '/dashboard/complaints', label: 'Raise Maintenance Ticket', icon: AlertOctagon },
          { path: '/dashboard/notices', label: 'Hostel Notices', icon: Bell },
        ],
      },
      {
        type: 'group',
        id: 'settings',
        label: 'My Account',
        icon: Settings,
        children: [
          { path: '/dashboard/settings', label: 'Profile & Security', icon: Settings },
        ],
      },
    ];
  }, [isStudent]);

  // Auto-expand group containing the active path
  useEffect(() => {
    const currentPath = location.pathname;
    filteredNavGroups.forEach((item) => {
      if (item.type === 'group' && item.children) {
        const hasActiveChild = item.children.some((child) => child.path === currentPath);
        if (hasActiveChild) {
          setExpandedGroups((prev) => ({ ...prev, [item.id]: true }));
        }
      }
    });
  }, [location.pathname, filteredNavGroups]);

  const toggleGroup = (groupId) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="dashboard-app-container" data-theme={theme}>
      {/* Full-Viewport Campus Background Layer with Lavender/Dark Translucent Overlay */}
      <div className="dashboard-campus-bg" aria-hidden="true">
        <img
          src="/assets/campus_bg.jpg"
          alt="GH Raisoni College Campus"
          className="campus-bg-image"
        />
        <div className="campus-bg-overlay" />
      </div>

      {/* MAIN TOP NAVIGATION BAR */}
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
          {/* Theme Toggle Button (Light/Dark Mode) */}
          <button
            type="button"
            onClick={toggleTheme}
            className="btn-theme-toggle"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme Mode"
          >
            {theme === 'dark' ? (
              <Sun size={17} className="theme-toggle-icon sun" />
            ) : (
              <Moon size={17} className="theme-toggle-icon moon" />
            )}
            <span className="theme-toggle-label">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          {/* Notifications Bell Dropdown */}
          <div className="notifications-wrapper" ref={notifRef}>
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className={`btn-navigator-bell ${showNotifications ? 'active' : ''}`}
              title="Notifications"
              aria-label="Open notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="notif-badge-count">{unreadCount}</span>
              )}
            </button>

            {showNotifications && (
              <div className="notifications-dropdown-card">
                <div className="notif-header">
                  <div className="notif-header-left">
                    <span className="notif-header-title">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="notif-header-pill">{unreadCount} new</span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      className="btn-mark-all-read"
                      title="Clear badge"
                    >
                      <CheckCheck size={14} />
                      <span>Mark all read</span>
                    </button>
                  )}
                </div>

                <div className="notif-list-container">
                  {notifications.length === 0 ? (
                    <div className="notif-empty-state">
                      <div className="empty-bell-icon">
                        <Bell size={24} />
                      </div>
                      <span className="empty-text">No pending notifications</span>
                      <span className="empty-subtext">All hostel records and dues are up to date!</span>
                    </div>
                  ) : (
                    notifications.map((item) => {
                      let IconComp = Bell;
                      if (item.type === 'complaint') IconComp = AlertOctagon;
                      if (item.type === 'fee') IconComp = CreditCard;
                      if (item.type === 'student') IconComp = UserPlus;
                      if (item.type === 'notice') IconComp = Megaphone;

                      return (
                        <div
                          key={item.id}
                          className="notif-item-row"
                          onClick={() => {
                            markAsRead(item.id);
                            setShowNotifications(false);
                            navigate(item.path);
                          }}
                        >
                          <div className={`notif-item-icon ${item.badgeColor}`}>
                            <IconComp size={16} />
                          </div>
                          <div className="notif-item-body">
                            <span className="notif-item-title">{item.title}</span>
                            <span className="notif-item-desc">{item.description}</span>
                            <span className="notif-item-time">{item.time}</span>
                          </div>
                          <ArrowRight size={13} className="notif-item-arrow" />
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Badge */}
          <div className="nav-user-pill">
            <span className="user-avatar-badge">
              {currentUser?.username?.charAt(0).toUpperCase() || 'A'}
            </span>
            <span className="user-username">{currentUser?.username || 'Admin'}</span>
          </div>

          {/* Top-Right Logout Button */}
          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className="btn-navigator-logout"
            title="Log out of Hostel Management System"
          >
            <div className="btn-icon-door">
              <LogOut size={16} />
            </div>
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* MAIN LAYOUT: Sidebar + Content Area */}
      <div className="dashboard-body-layout">
        {/* LIGHT/DARK THEMED SIDEBAR */}
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
              {filteredNavGroups.map((item) => {
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
                          const SubIcon = child.icon;
                          return (
                            <NavLink
                              key={child.path}
                              to={child.path}
                              onClick={() => setMobileMenuOpen(false)}
                              className={`sidebar-subnav-item ${isChildActive ? 'active' : ''}`}
                            >
                              {SubIcon ? (
                                <SubIcon size={15} className="subnav-custom-icon" />
                              ) : (
                                <span className="subnav-indicator-dot" />
                              )}
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

          {/* Subtle Campus Watermark Footer */}
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
    </div>
  );
}
