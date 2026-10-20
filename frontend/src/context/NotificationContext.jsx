import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { dashboardApi } from '../services/api/dashboard.api';
import { formatCurrency } from '../utils/formatters';

/**
 * @typedef {Object} NotificationItem
 * @property {string} id
 * @property {'complaint'|'fee'|'notice'} type
 * @property {string} title
 * @property {string} description
 * @property {string} time
 * @property {string} path
 * @property {string} badgeColor
 * @property {boolean} read
 */

/**
 * @typedef {Object} NotificationContextValue
 * @property {NotificationItem[]} notifications
 * @property {number} unreadCount
 * @property {boolean} loading
 * @property {() => Promise<void>} refreshNotifications
 * @property {(id: string) => void} markAsRead
 * @property {() => void} markAllAsRead
 */

const NotificationContext = createContext(/** @type {NotificationContextValue|null} */ (null));

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadIds, setUnreadIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const refreshNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const summary = await dashboardApi.getDashboardSummary();
      if (!summary) return;

      const items = [];

      // 1. Pending Complaints
      if (Array.isArray(summary.pending_complaints)) {
        summary.pending_complaints.slice(0, 3).forEach((comp) => {
          items.push({
            id: `comp-${comp.id}`,
            type: 'complaint',
            title: comp.title || 'Unresolved Complaint',
            description: `Room ${comp.room_number || 'N/A'} • ${comp.complaint_type || 'Maintenance'}`,
            time: comp.submission_date || 'Pending',
            path: '/dashboard/complaints',
            badgeColor: 'rose',
          });
        });
      }

      // 2. Pending Fees
      if (summary.metrics && Number(summary.metrics.total_pending) > 0) {
        items.push({
          id: 'fee-pending',
          type: 'fee',
          title: 'Pending Fee Dues',
          description: `${formatCurrency(summary.metrics.total_pending)} pending balance`,
          time: 'Payment Due',
          path: '/dashboard/fees',
          badgeColor: 'amber',
        });
      }

      // 3. Latest Published Notices
      if (Array.isArray(summary.latest_notices)) {
        summary.latest_notices.slice(0, 2).forEach((notif) => {
          items.push({
            id: `notice-${notif.id}`,
            type: 'notice',
            title: notif.title || 'Official Circular',
            description: notif.content ? notif.content.slice(0, 55) + '...' : 'Notice published',
            time: notif.published_date || 'Notice',
            path: '/dashboard/notices',
            badgeColor: 'indigo',
          });
        });
      }

      setNotifications(items);
      // Mark all new items as unread initially
      setUnreadIds((prev) => {
        const next = new Set(prev);
        items.forEach((item) => {
          if (!prev.has(item.id)) {
            next.add(item.id);
          }
        });
        return next;
      });
    } catch {
      // Soft fail silently if backend is temporarily unreachable
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  const markAsRead = useCallback((id) => {
    setUnreadIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setUnreadIds(new Set());
  }, []);

  const itemsWithReadStatus = notifications.map((n) => ({
    ...n,
    read: !unreadIds.has(n.id),
  }));

  const value = {
    notifications: itemsWithReadStatus,
    unreadCount: unreadIds.size,
    loading,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
}

export default NotificationContext;
