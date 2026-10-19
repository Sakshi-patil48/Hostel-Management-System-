import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hostelService } from '../services/hostelService';
import {
  Users, Building2, Bed, CreditCard, CalendarCheck,
  AlertOctagon, TrendingUp, PlusCircle, ArrowRight,
  Clock, ShieldAlert, Sparkles, CheckCircle2, DollarSign
} from 'lucide-react';

export default function DashboardHome() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await hostelService.getDashboardSummary();
      setData(res);
      setError('');
    } catch (err) {
      setError('Unable to load live dashboard metrics. Please ensure backend is reachable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  if (loading) {
    return (
      <div className="page-loading-skeleton">
        <div className="skeleton-banner" />
        <div className="skeleton-grid-4">
          <div className="skeleton-card" />
          <div className="skeleton-card" />
          <div className="skeleton-card" />
          <div className="skeleton-card" />
        </div>
        <div className="skeleton-card-large" />
      </div>
    );
  }

  const metrics = data?.metrics || {
    total_students: 10,
    active_students: 9,
    total_rooms: 11,
    total_beds: 22,
    occupied_beds: 7,
    vacant_beds: 15,
    occupancy_rate: 31.8,
    total_collected: 146000,
    total_pending: 286000,
    attendance_today: { present: 7, absent: 1, leave: 1, rate: 77.8 },
    open_complaints: 4,
  };

  return (
    <div className="dashboard-home-page">
      {/* WELCOME BANNER */}
      <div className="welcome-banner-card">
        <div className="welcome-text-group">
          <div className="date-badge">
            <Clock size={14} />
            <span>{todayStr}</span>
          </div>
          <h1 className="welcome-title">Hostel Operations Dashboard</h1>
          <p className="welcome-subtitle">
            Overview of student occupancy, fee collections, daily attendance, and maintenance tickets.
          </p>
        </div>

        <div className="quick-action-strip">
          <button onClick={() => navigate('/dashboard/new-student')} className="btn-quick-action">
            <PlusCircle size={15} />
            <span>New Student</span>
          </button>
          <button onClick={() => navigate('/dashboard/allocation')} className="btn-quick-action">
            <Bed size={15} />
            <span>Allocate Bed</span>
          </button>
          <button onClick={() => navigate('/dashboard/fees')} className="btn-quick-action">
            <DollarSign size={15} />
            <span>Record Payment</span>
          </button>
          <button onClick={() => navigate('/dashboard/notices')} className="btn-quick-action">
            <Sparkles size={15} />
            <span>Post Notice</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="dashboard-alert-banner">
          <ShieldAlert size={18} />
          <span>{error}</span>
          <button onClick={fetchSummary} className="btn-retry">Retry</button>
        </div>
      )}

      {/* PRIMARY METRICS 4-COLUMN GRID */}
      <div className="metrics-grid">
        {/* Card 1: Students */}
        <div className="stat-glass-card" onClick={() => navigate('/dashboard/students')}>
          <div className="stat-card-header">
            <span className="stat-title">Total Residents</span>
            <div className="stat-icon-wrap icon-purple">
              <Users size={20} />
            </div>
          </div>
          <div className="stat-value">{metrics.total_students}</div>
          <div className="stat-sub-info">
            <span className="stat-badge green">{metrics.active_students} Active Living</span>
            <span className="stat-text">{metrics.leaved_students || 1} Checked Out</span>
          </div>
        </div>

        {/* Card 2: Rooms & Beds */}
        <div className="stat-glass-card" onClick={() => navigate('/dashboard/rooms')}>
          <div className="stat-card-header">
            <span className="stat-title">Bed Occupancy</span>
            <div className="stat-icon-wrap icon-blue">
              <Building2 size={20} />
            </div>
          </div>
          <div className="stat-value">{metrics.occupancy_rate}%</div>
          <div className="stat-sub-info">
            <span className="stat-badge blue">{metrics.occupied_beds} / {metrics.total_beds} Beds</span>
            <span className="stat-text">{metrics.vacant_beds} Available</span>
          </div>
        </div>

        {/* Card 3: Fee Collections */}
        <div className="stat-glass-card" onClick={() => navigate('/dashboard/fees')}>
          <div className="stat-card-header">
            <span className="stat-title">Fee Collected</span>
            <div className="stat-icon-wrap icon-green">
              <CreditCard size={20} />
            </div>
          </div>
          <div className="stat-value">₹ {Number(metrics.total_collected).toLocaleString('en-IN')}</div>
          <div className="stat-sub-info">
            <span className="stat-badge amber">₹ {Number(metrics.total_pending).toLocaleString('en-IN')} Pending</span>
          </div>
        </div>

        {/* Card 4: Attendance & Tickets */}
        <div className="stat-glass-card" onClick={() => navigate('/dashboard/attendance')}>
          <div className="stat-card-header">
            <span className="stat-title">Today's Roll Call</span>
            <div className="stat-icon-wrap icon-rose">
              <CalendarCheck size={20} />
            </div>
          </div>
          <div className="stat-value">{metrics.attendance_today?.rate || 80}%</div>
          <div className="stat-sub-info">
            <span className="stat-badge green">{metrics.attendance_today?.present || 0} Present</span>
            <span className="stat-badge red">{metrics.attendance_today?.absent || 0} Absent</span>
          </div>
        </div>
      </div>

      {/* TWO COLUMN LOWER LAYOUT */}
      <div className="dashboard-columns-split">
        {/* Left Column: Block Occupancy & Recent Payments */}
        <div className="dash-col">
          {/* Block Occupancy Progress */}
          <div className="glass-panel-section">
            <div className="section-header-row">
              <h3>Hostel Blocks & Bed Availability</h3>
              <button onClick={() => navigate('/dashboard/rooms')} className="btn-view-all">
                <span>View Rooms</span>
                <ArrowRight size={14} />
              </button>
            </div>
            <div className="blocks-occupancy-list">
              {data?.blocks_occupancy?.map((b, idx) => {
                const pct = b.total_beds > 0 ? Math.round((b.occupied_beds / b.total_beds) * 100) : 0;
                return (
                  <div key={idx} className="block-progress-item">
                    <div className="block-name-row">
                      <strong>{b.block}</strong>
                      <span>{b.occupied_beds} / {b.total_beds} Beds ({pct}%)</span>
                    </div>
                    <div className="progress-bar-track">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${pct}%`, backgroundColor: pct > 80 ? '#ef4444' : pct > 50 ? '#f59e0b' : '#22c55e' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Payments Feed */}
          <div className="glass-panel-section">
            <div className="section-header-row">
              <h3>Recent Payment Transactions</h3>
              <button onClick={() => navigate('/dashboard/payments')} className="btn-view-all">
                <span>All Payments</span>
                <ArrowRight size={14} />
              </button>
            </div>
            <div className="payments-feed-list">
              {data?.recent_payments?.slice(0, 4).map((p) => (
                <div key={p.id} className="payment-feed-item">
                  <div className="p-icon">
                    <CheckCircle2 size={18} className="text-green-500" />
                  </div>
                  <div className="p-details">
                    <strong>{p.student_name}</strong>
                    <span className="p-sub">{p.receipt_number} • {p.payment_date}</span>
                  </div>
                  <div className="p-amount">
                    ₹ {Number(p.amount_paid).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Pending Complaints & Latest Notices */}
        <div className="dash-col">
          {/* Pending Complaints */}
          <div className="glass-panel-section">
            <div className="section-header-row">
              <h3>Pending Resident Complaints</h3>
              <button onClick={() => navigate('/dashboard/complaints')} className="btn-view-all">
                <span>View Tickets</span>
                <ArrowRight size={14} />
              </button>
            </div>
            <div className="complaints-feed-list">
              {data?.pending_complaints?.length === 0 ? (
                <div className="empty-state-card">
                  <CheckCircle2 size={24} className="text-green-500" />
                  <p>No pending complaints! All tickets are addressed.</p>
                </div>
              ) : (
                data?.pending_complaints?.slice(0, 3).map((c) => (
                  <div key={c.id} className="complaint-feed-item">
                    <div className="c-header-row">
                      <span className={`badge-priority ${c.priority}`}>{c.priority}</span>
                      <span className="c-room">Room {c.room_number || 'N/A'}</span>
                    </div>
                    <strong className="c-title">{c.title}</strong>
                    <span className="c-student">{c.student_name} • {c.submission_date}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Latest Notices */}
          <div className="glass-panel-section">
            <div className="section-header-row">
              <h3>Latest Campus Notices</h3>
              <button onClick={() => navigate('/dashboard/notices')} className="btn-view-all">
                <span>All Notices</span>
                <ArrowRight size={14} />
              </button>
            </div>
            <div className="notices-feed-list">
              {data?.latest_notices?.slice(0, 3).map((n) => (
                <div key={n.id} className="notice-feed-item">
                  <div className="n-top">
                    <span className={`notice-tag ${n.priority}`}>{n.priority}</span>
                    <span className="n-date">{n.publication_date}</span>
                  </div>
                  <strong className="n-title">{n.title}</strong>
                  <p className="n-desc">{n.description.substring(0, 95)}...</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
