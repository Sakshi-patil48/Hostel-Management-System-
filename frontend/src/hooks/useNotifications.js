import { useNotificationContext } from '../context/NotificationContext';

/**
 * Custom hook to access live system alerts, notices, and notifications
 * @returns {import('../context/NotificationContext').NotificationContextValue}
 */
export function useNotifications() {
  return useNotificationContext();
}

export default useNotifications;
