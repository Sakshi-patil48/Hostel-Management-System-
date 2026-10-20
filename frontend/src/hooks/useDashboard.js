import { useState, useEffect, useCallback } from 'react';
import { dashboardApi } from '../services/api/dashboard.api';

const DEFAULT_METRICS = {
  total_students: 10,
  active_students: 9,
  total_rooms: 16,
  total_beds: 31,
  occupied_beds: 7,
  vacant_beds: 24,
  occupancy_rate: 22.6,
  total_collected: 146000,
  total_pending: 286000,
  attendance_today: { present: 7, absent: 1, leave: 1, rate: 77.8 },
  open_complaints: 4,
};

/**
 * Custom hook to fetch and manage Dashboard summary statistics
 */
export function useDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await dashboardApi.getDashboardSummary();
      setData(res);
    } catch (err) {
      setError(err.message || 'Unable to load live dashboard metrics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const metrics = data?.metrics || DEFAULT_METRICS;
  const recentNotices = data?.latest_notices || [];
  const pendingComplaints = data?.pending_complaints || [];

  return {
    data,
    metrics,
    recentNotices,
    pendingComplaints,
    loading,
    error,
    refreshDashboard: fetchSummary,
  };
}

export default useDashboard;
