import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../hooks/useDashboard';
import { useCountUp } from '../hooks/useCountUp';
import { formatCurrency, formatDate } from '../utils/formatters';
import TiltCard from '../components/common/TiltCard';
import FeedbackBanner from '../components/common/FeedbackBanner';
import {
  Users, Building2, Bed, CreditCard, CalendarCheck,
  PlusCircle, ArrowRight, Clock, CheckCircle2, DollarSign, Sparkles
} from 'lucide-react';

export default function DashboardHome() {
  const navigate = useNavigate();
  const { data, metrics, loading, error, refreshDashboard } = useDashboard();

  const todayStr = formatDate(new Date(), 'long');

  // Smooth numerical count-up animations for statistics
  const animatedResidents = useCountUp(metrics.total_students, 900);
  const animatedOccupancy = useCountUp(metrics.occupancy_rate, 900, true);
  const animatedFees = useCountUp(metrics.total_collected, 1000);
  const animatedAttendance = useCountUp(metrics.attendance_today?.rate || 80, 900, true);

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

  return (
    <div className="dashboard-home-page">
      {/* WELCOME BANNER */}
      <div className="welcome-banner-card animate-mount-banner">
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
        <FeedbackBanner
          type="error"
          message={error}
          onClose={refreshDashboard}
          className="mb-4"
        />
      )}

      {/* PRIMARY METRICS 4-COLUMN GRID WITH 3D TILT */}
      <div className="metrics-grid">
        {/* Card 1: Students */}
        <TiltCard
          className="stat-glass-card stagger-card-1"
          onClick={() => navigate('/dashboard/students')}
        >
          <div className="stat-card-header">
            <span className="stat-title">Total Residents</span>
            <div className="stat-icon-wrap icon-purple">
              <Users size={20} />
            </div>
          </div>
          <div className="stat-value">{animatedResidents}</div>
          <div className="stat-sub-info">
            <span className="stat-badge green">{metrics.active_students} Active Living</span>
            <span className="stat-text">{metrics.leaved_students || 1} Checked Out</span>
          </div>
        </TiltCard>

        {/* Card 2: Rooms & Beds */}
        <TiltCard
          className="stat-glass-card stagger-card-2"
          onClick={() => navigate('/dashboard/rooms')}
        >
          <div className="stat-card-header">
            <span className="stat-title">Bed Occupancy</span>
            <div className="stat-icon-wrap icon-blue">
              <Building2 size={20} />
            </div>
          </div>
          <div className="stat-value">{animatedOccupancy}%</div>
          <div className="stat-sub-info">
            <span className="stat-badge blue">{metrics.occupied_beds} / {metrics.total_beds} Beds</span>
            <span className="stat-text">{metrics.vacant_beds} Available</span>
          </div>
        </TiltCard>

        {/* Card 3: Fee Collections */}
        <TiltCard
          className="stat-glass-card stagger-card-3"
          onClick={() => navigate('/dashboard/fees')}
        >
          <div className="stat-card-header">
            <span className="stat-title">Fee Collected</span>
            <div className="stat-icon-wrap icon-green">
              <CreditCard size={20} />
            </div>
          </div>
          <div className="stat-value">{formatCurrency(animatedFees)}</div>
          <div className="stat-sub-info">
            <span className="stat-badge amber">{formatCurrency(metrics.total_pending)} Pending</span>
          </div>
        </TiltCard>

        {/* Card 4: Attendance & Tickets */}
        <TiltCard
          className="stat-glass-card stagger-card-4"
          onClick={() => navigate('/dashboard/attendance')}
        >
          <div className="stat-card-header">
            <span className="stat-title">Today's Roll Call</span>
            <div className="stat-icon-wrap icon-rose">
              <CalendarCheck size={20} />
            </div>
          </div>
          <div className="stat-value">{animatedAttendance}%</div>
          <div className="stat-sub-info">
            <span className="stat-badge green">{metrics.attendance_today?.present || 0} Present</span>
            <span className="stat-badge red">{metrics.attendance_today?.absent || 0} Absent</span>
          </div>
        </TiltCard>
      </div>

      {/* TWO COLUMN LOWER LAYOUT */}
      <div className="dashboard-columns-split">
        {/* Left Column: Block Occupancy & Recent Payments */}
        <div className="dash-col">
          {/* Block Occupancy Progress */}
          <div className="glass-panel-section stagger-panel-1">
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
          <div className="glass-panel-section stagger-panel-2">
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
                    {formatCurrency(p.amount_paid)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Pending Complaints & Latest Notices */}
        <div className="dash-col">
          {/* Pending Complaints */}
          <div className="glass-panel-section stagger-panel-1">
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
          <div className="glass-panel-section stagger-panel-2">
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
