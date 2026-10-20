import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  QrCode, Camera, ShieldCheck, CheckCircle2, AlertCircle,
  Clock, RefreshCw, Copy, Check, User,
  Award, Sparkles,
  PlayCircle, StopCircle, Search
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { hostelService } from '../services/hostelService';
import FeedbackBanner from '../components/common/FeedbackBanner';
import StatusBadge from '../components/common/StatusBadge';
import MetricCard from '../components/common/MetricCard';
import { formatDisplayId } from '../utils/formatters';
import './StudentAttendancePortal.css';

export default function StudentAttendancePortal() {
  const { user: currentUser } = useAuth();
  const isStudentUser = currentUser?.role === 'student' || (!currentUser?.is_staff && currentUser?.student);

  // Active Tab: 'student' (Resident Portal), 'warden' (Session Generator), 'audit' (Audit Log)
  const [activeTab, setActiveTab] = useState('student');

  // Student Profile & Data
  const [studentProfile, setStudentProfile] = useState(null);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [allStudentsList, setAllStudentsList] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(
    currentUser?.student?.student_id || 'HST-2026-001'
  );

  // Warden Live Session State
  const [activeSession, setActiveSession] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [sessionRemainingSec, setSessionRemainingSec] = useState(0);
  const [sessionStats, setSessionStats] = useState({ total: 10, checkedIn: 0, attendees: [] });

  // Session Generator Form State
  const [newSessionTitle, setNewSessionTitle] = useState('Evening Curfew Roll Call — 09:30 PM');
  const [newSessionType, setNewSessionType] = useState('evening_roll_call');
  const [newSessionDuration, setNewSessionDuration] = useState(15);

  // Check-in State in Student Portal
  const [pinCode, setPinCode] = useState('');
  const [submittingCheckIn, setSubmittingCheckIn] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Camera QR Scanner State
  const [scannerActive, setScannerActive] = useState(false);
  const [scannerError, setScannerError] = useState('');
  const html5QrCodeRef = useRef(null);

  // PIN Copied notification
  const [copiedCode, setCopiedCode] = useState(false);

  // History Filter
  const [historySearch, setHistorySearch] = useState('');

  // Audit Log State
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);

  // Helper functions declared before effects
  const loadStudentData = useCallback(async (studentId) => {
    try {
      const [profileRes, attRes] = await Promise.all([
        hostelService.getStudentProfile(studentId),
        hostelService.getStudentAttendanceHistory(studentId),
      ]);

      setStudentProfile(profileRes);
      if (attRes) {
        setAttendanceStats(attRes.stats || null);
        setAttendanceHistory(attRes.history || []);
        setTodayRecord(attRes.today_record || null);
      }
    } catch (err) {
      console.error('Error loading student attendance profile:', err);
    }
  }, []);

  const checkActiveSession = useCallback(async () => {
    try {
      setSessionLoading(true);
      const res = await hostelService.getActiveAttendanceSession();
      if (res && res.active && res.session) {
        setActiveSession(res.session);
        setSessionRemainingSec(res.session.remaining_seconds || 0);
        setSessionStats({
          total: res.total_students || 10,
          checkedIn: res.checked_in_count || 0,
          attendees: res.recent_attendees || [],
        });
      } else {
        setActiveSession(null);
        setSessionRemainingSec(0);
      }
    } catch (err) {
      console.error('Error checking active session:', err);
    } finally {
      setSessionLoading(false);
    }
  }, []);

  const loadInitialData = useCallback(async () => {
    try {
      const students = await hostelService.getStudents({ status: 'active' });
      setAllStudentsList(students || []);
      await loadStudentData(selectedStudentId);
      await checkActiveSession();
    } catch (err) {
      console.error('Error loading attendance portal data:', err);
    }
  }, [selectedStudentId, loadStudentData, checkActiveSession]);

  // 1. Initial Load: Students list, Current Student Profile, Active Session
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // 2. Countdown Timer for Active Session
  useEffect(() => {
    if (!activeSession || sessionRemainingSec <= 0) return;

    const interval = setInterval(() => {
      setSessionRemainingSec((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          checkActiveSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession, sessionRemainingSec, checkActiveSession]);

  // Stop camera scanner callback
  const stopCameraScanner = useCallback(async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.warn('Error stopping QR scanner:', err);
      }
    }
  }, []);

  // 5. Execute Check-In Submission declared before scanner
  const executeCheckIn = useCallback(async ({ session_token, session_code, method }) => {
    setSubmittingCheckIn(true);
    setFeedback({ type: '', message: '' });

    try {
      const payload = {
        student_id: selectedStudentId,
        method: method || (session_code ? 'session_code' : 'qr_code'),
        device_info: `${navigator.platform || 'Device'} • ${navigator.userAgent.slice(0, 80)}`,
      };

      if (session_token) payload.session_token = session_token;
      if (session_code) payload.session_code = session_code;

      const res = await hostelService.studentCheckIn(payload);

      setFeedback({
        type: 'success',
        message: `🎉 ${res.message || 'Attendance verified and marked successfully!'}`,
      });

      // Clear PIN input
      setPinCode('');

      // Refresh student attendance record
      await loadStudentData(selectedStudentId);
      // Refresh warden active session stats
      await checkActiveSession();
    } catch (err) {
      console.error('Check-in error:', err);
      const errMsg = err?.data?.error || err?.message || 'Check-in failed. Please verify session validity.';
      setFeedback({
        type: 'error',
        message: errMsg,
      });
    } finally {
      setSubmittingCheckIn(false);
    }
  }, [selectedStudentId, loadStudentData, checkActiveSession]);

  // QR scan handler using executeCheckIn and stopCameraScanner
  const handleQrScanSuccess = useCallback(async (scannedValue) => {
    let token = scannedValue;
    try {
      const parsed = JSON.parse(scannedValue);
      if (parsed.token) token = parsed.token;
      if (parsed.code && !parsed.token) {
        return executeCheckIn({ session_code: parsed.code, method: 'qr_code' });
      }
    } catch {
      // Raw string token
    }

    await stopCameraScanner();
    setScannerActive(false);
    await executeCheckIn({ session_token: token, method: 'qr_code' });
  }, [stopCameraScanner, executeCheckIn]);

  const startCameraScanner = useCallback(async () => {
    setScannerError('');
    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode('qr-reader-container');
      }

      await html5QrCodeRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          handleQrScanSuccess(decodedText);
        },
        () => {
          // Searching frame - no QR
        }
      );
    } catch (err) {
      console.warn('Camera scanner initialization error:', err);
      setScannerError('Camera access unavailable or permission denied. You can use the 6-Digit PIN fallback below.');
      setScannerActive(false);
    }
  }, [handleQrScanSuccess]);

  // 3. QR Camera Scanner Lifecycle
  useEffect(() => {
    if (scannerActive) {
      startCameraScanner();
    } else {
      stopCameraScanner();
    }
    return () => {
      stopCameraScanner();
    };
  }, [scannerActive, startCameraScanner, stopCameraScanner]);

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (!pinCode.trim() || pinCode.trim().length !== 6) {
      setFeedback({
        type: 'error',
        message: 'Please enter a valid 6-digit session PIN (e.g., 482195).',
      });
      return;
    }
    executeCheckIn({ session_code: pinCode.trim(), method: 'session_code' });
  };

  // 6. Warden Session Actions
  const handleCreateSession = async (e) => {
    e.preventDefault();
    setSessionLoading(true);
    setFeedback({ type: '', message: '' });

    try {
      const res = await hostelService.createAttendanceSession({
        title: newSessionTitle,
        session_type: newSessionType,
        duration_minutes: Number(newSessionDuration),
        created_by: currentUser?.username || 'Hostel Chief Warden',
      });

      setFeedback({
        type: 'success',
        message: `✅ Live roll call session "${newSessionTitle}" created! Students can now scan the QR code or enter code ${res.session?.code}.`,
      });

      await checkActiveSession();
    } catch (err) {
      console.error('Error creating session:', err);
      setFeedback({
        type: 'error',
        message: err?.data?.error || 'Failed to create live roll call session.',
      });
    } finally {
      setSessionLoading(false);
    }
  };

  const handleCloseSession = async () => {
    if (!activeSession) return;
    try {
      await hostelService.closeAttendanceSession(activeSession.id);
      setFeedback({
        type: 'info',
        message: `Session "${activeSession.title}" has been closed.`,
      });
      await checkActiveSession();
    } catch (err) {
      console.error('Error closing session:', err);
    }
  };

  const handleCopyCode = () => {
    if (!activeSession?.code) return;
    navigator.clipboard.writeText(activeSession.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // 7. Load Audit Logs
  const loadAuditLogs = async () => {
    try {
      setAuditLoading(true);
      const res = await hostelService.getAttendanceAuditLog();
      setAuditLogs(res?.records || []);
    } catch (err) {
      console.error('Error loading audit logs:', err);
    } finally {
      setAuditLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'audit') {
      loadAuditLogs();
    }
  }, [activeTab]);

  // Format countdown mm:ss
  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Filtered History
  const filteredHistory = useMemo(() => {
    if (!historySearch.trim()) return attendanceHistory;
    const q = historySearch.toLowerCase();
    return attendanceHistory.filter(
      (h) =>
        (h.date && h.date.toLowerCase().includes(q)) ||
        (h.status && h.status.toLowerCase().includes(q)) ||
        (h.method && h.method.toLowerCase().includes(q)) ||
        (h.session_title && h.session_title.toLowerCase().includes(q))
    );
  }, [attendanceHistory, historySearch]);

  const qrPayloadString = useMemo(() => {
    if (!activeSession) return '';
    return JSON.stringify({
      type: 'ghr_hostel_attendance',
      token: activeSession.token,
      code: activeSession.code,
      title: activeSession.title,
      date: activeSession.date,
    });
  }, [activeSession]);

  return (
    <div className="portal-page-wrapper animate-fadeIn">
      {/* Section A: Page Heading & Section B: Navigation Tabs */}
      <div className="portal-header-row">
        <div className="portal-brand-block">
          <div className="portal-brand-icon">
            <QrCode size={26} />
          </div>
          <div>
            <h1 className="portal-title">
              Student Attendance Portal
            </h1>
            <p className="portal-subtitle">
              QR Check-in, Time-Limited Roll Call Sessions & Monthly Attendance Analytics
            </p>
          </div>
        </div>

        {/* Section B: Tab Navigation Pill Group */}
        <div className="portal-nav-pill-group">
          <button
            type="button"
            onClick={() => setActiveTab('student')}
            className={`portal-nav-btn ${activeTab === 'student' ? 'active' : ''}`}
          >
            <User size={16} />
            <span>Student Self Check-In</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('warden')}
            className={`portal-nav-btn ${activeTab === 'warden' ? 'active' : ''}`}
          >
            <QrCode size={16} />
            <span>Warden Roll Call QR</span>
            {activeSession && <span className="portal-live-pill">LIVE</span>}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`portal-nav-btn ${activeTab === 'audit' ? 'active' : ''}`}
          >
            <ShieldCheck size={16} />
            <span>Audit Trail</span>
          </button>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedback.message && (
        <div style={{ marginBottom: '20px' }}>
          <FeedbackBanner
            type={feedback.type || 'info'}
            message={feedback.message}
            onClose={() => setFeedback({ type: '', message: '' })}
          />
        </div>
      )}

      {/* =========================================================================
          TAB 1: RESIDENT STUDENT SELF CHECK-IN
          ========================================================================= */}
      {activeTab === 'student' && (
        <div>
          {/* Section C: Student Profile Selector */}
          <div className="portal-selector-bar">
            <div className="portal-selector-info">
              <Sparkles size={18} color="#7C3AED" />
              <span className="portal-selector-label">
                {isStudentUser ? 'Authenticated Resident:' : 'Resident Profile View:'}
              </span>
              <span className="portal-id-badge">
                {formatDisplayId(selectedStudentId)}
              </span>
            </div>

            <div className="portal-selector-controls">
              {!isStudentUser ? (
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="portal-select-dropdown"
                  aria-label="Select Resident Student"
                >
                  {allStudentsList.map((s) => (
                    <option key={s.id} value={s.student_id}>
                      {formatDisplayId(s.student_id)} — {s.full_name} ({s.current_room ? `Room ${s.current_room}` : 'No Room'})
                    </option>
                  ))}
                </select>
              ) : (
                <span style={{ fontSize: '0.82rem', color: '#16A34A', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={15} /> Authenticated Student Profile
                </span>
              )}

              <button
                type="button"
                onClick={() => loadStudentData(selectedStudentId)}
                title="Refresh Attendance Stats & Profile"
                className="portal-btn-refresh"
              >
                <RefreshCw size={14} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Section D: Balanced Two-Column Section (Student Profile & Today's Attendance) */}
          <div className="portal-profile-grid">
            {/* Column 1: Student Profile Summary Card */}
            <div className="portal-card">
              <div>
                <div className="portal-profile-header">
                  <div className="portal-avatar-badge">
                    {studentProfile?.full_name
                      ? studentProfile.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                      : 'ST'}
                  </div>
                  <div>
                    <h3 className="portal-profile-name">
                      {studentProfile?.full_name || 'Loading Resident Profile...'}
                    </h3>
                    <div className="portal-profile-meta">
                      <span className="portal-id-badge">
                        {formatDisplayId(studentProfile?.student_id || selectedStudentId)}
                      </span>
                      <span className="portal-course-text">
                        {[studentProfile?.course, studentProfile?.year_of_study ? `Year ${studentProfile.year_of_study}` : ''].filter(Boolean).join(' • ') || 'Degree Resident'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="portal-room-details-grid">
                  <div>
                    <div className="portal-detail-label">Hostel Room</div>
                    <div className="portal-detail-value">
                      {studentProfile?.current_room ? `Room ${studentProfile.current_room}` : 'Not Assigned'}
                    </div>
                  </div>

                  <div>
                    <div className="portal-detail-label">Bed Allocation</div>
                    <div className="portal-detail-value">
                      {studentProfile?.current_bed ? `Bed ${studentProfile.current_bed}` : 'Pending Allocation'}
                    </div>
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <div className="portal-detail-label">Hostel Block</div>
                    <div className="portal-detail-value">
                      {studentProfile?.block_name || 'Main Campus Hostel Block'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Today's Live Attendance Status Card */}
            <div className={`portal-card portal-status-card ${todayRecord ? 'marked' : 'pending'}`}>
              <div>
                <div className="portal-status-top">
                  <span style={{ fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748B' }}>
                    Today's Curfew Verification
                  </span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B' }}>
                    {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                <div className="portal-status-headline-wrap">
                  <div className={`portal-status-circle-icon ${todayRecord ? 'marked' : 'pending'}`}>
                    {todayRecord ? <CheckCircle2 size={30} /> : <Clock size={28} />}
                  </div>

                  <div>
                    <h2 className={`portal-status-title ${todayRecord ? 'marked' : 'pending'}`}>
                      {todayRecord ? 'MARKED PRESENT' : 'NOT MARKED YET'}
                    </h2>
                    <p className="portal-status-subtext">
                      {todayRecord
                        ? `Verified at ${todayRecord.verified_at ? new Date(todayRecord.verified_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Roll Call'}`
                        : 'Curfew roll call pending for today. Please complete verification below.'}
                    </p>
                  </div>
                </div>
              </div>

              {todayRecord ? (
                <div className="portal-status-footer-pill">
                  <span style={{ color: '#64748B', fontWeight: 500 }}>Verification Method:</span>
                  <span style={{ fontWeight: 700, color: '#15803D', textTransform: 'capitalize' }}>
                    {todayRecord.method?.replace('_', ' ') || 'QR Code Check-in'}
                  </span>
                </div>
              ) : activeSession ? (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: '#FEF3C7',
                  border: '1px solid #FCD34D',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.84rem',
                  color: '#92400E'
                }}>
                  <span>Active Session: <strong>{activeSession.title}</strong></span>
                  <span style={{ fontWeight: 800 }}>Code: {activeSession.code}</span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Section E: Attendance Statistics 4-Column Grid */}
          <div className="portal-stats-section">
            <div className="portal-stats-grid">
              <MetricCard
                label="Monthly Attendance"
                numericValue={attendanceStats?.percentage ?? 100}
                isPercentage={true}
                suffix="%"
                subText={`${attendanceStats?.month_name || 'Current Month'} Attendance Rate`}
                icon={<Award size={22} />}
                color="purple"
              />
              <MetricCard
                label="Days Present"
                numericValue={attendanceStats?.present_days ?? 0}
                subText={`Out of ${attendanceStats?.total_days ?? 0} Total Sessions`}
                icon={<CheckCircle2 size={22} />}
                color="emerald"
              />
              <MetricCard
                label="Unexcused Absences"
                numericValue={attendanceStats?.absent_days ?? 0}
                subText="Curfew Violations / Absent"
                icon={<AlertCircle size={22} />}
                color="rose"
              />
              <MetricCard
                label="Approved Leave"
                numericValue={attendanceStats?.leave_days ?? 0}
                subText="Permitted Warden Passes"
                icon={<Clock size={22} />}
                color="blue"
              />
            </div>
          </div>

          {/* Self Check-in Interactive Box (Only if not marked today) */}
          {/* Self Check-in Interactive Box (Only if not marked today) */}
          {!todayRecord ? (
            <div className="portal-card portal-checkin-card">
              <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '16px', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
                  Mark Today's Attendance
                </h3>
                <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '0.88rem' }}>
                  Enter the 6-digit session PIN displayed on your warden's roll call screen, or scan the QR code.
                </p>
              </div>

              {/* Active Session Notice & 1-Click Autofill */}
              {activeSession && (
                <div style={{
                  padding: '12px 18px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)',
                  border: '1px solid #DDD6FE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                  marginBottom: '22px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      background: '#16A34A',
                      color: '#FFF',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '6px'
                    }}>
                      LIVE ROLL CALL
                    </span>
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1E1B4B' }}>
                      {activeSession.title}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPinCode(activeSession.code)}
                    style={{
                      background: '#7C3AED',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)'
                    }}
                  >
                    <Sparkles size={14} />
                    <span>⚡ Autofill Code: {activeSession.code}</span>
                  </button>
                </div>
              )}

              {/* 6-Digit PIN Submission Form */}
              <div style={{ maxWidth: '440px', margin: '0 auto', textAlign: 'center' }}>
                <form onSubmit={handlePinSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label htmlFor="session-pin-input" style={{ fontSize: '0.94rem', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '8px' }}>
                      Enter 6-Digit Roll Call PIN:
                    </label>

                    <input
                      id="session-pin-input"
                      type="text"
                      maxLength={6}
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="1 2 3 4 5 6"
                      autoFocus
                      style={{
                        width: '100%',
                        textAlign: 'center',
                        letterSpacing: '10px',
                        fontSize: '2rem',
                        fontWeight: 900,
                        padding: '14px 20px',
                        borderRadius: '14px',
                        border: '2px solid #D8CCFF',
                        background: '#FFFFFF',
                        color: '#7C3AED',
                        outline: 'none',
                        boxShadow: '0 4px 14px rgba(124, 58, 237, 0.1)',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingCheckIn || pinCode.length !== 6}
                    className="btn-save-primary"
                    style={{
                      padding: '14px 24px',
                      fontSize: '1.02rem',
                      fontWeight: 800,
                      justifyContent: 'center',
                      borderRadius: '12px',
                      boxShadow: '0 4px 16px rgba(124, 58, 237, 0.3)'
                    }}
                  >
                    {submittingCheckIn ? 'Verifying with Server...' : '✓ Mark Present Now'}
                  </button>
                </form>

                {/* Camera QR Scanner Option Toggle */}
                <div style={{ marginTop: '22px', borderTop: '1px dashed #E2E8F0', paddingTop: '16px' }}>
                  {!scannerActive ? (
                    <button
                      type="button"
                      onClick={() => setScannerActive(true)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#6D28D9',
                        fontWeight: 600,
                        fontSize: '0.86rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Camera size={16} />
                      <span>Prefer camera? Click here to scan QR code</span>
                    </button>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', marginTop: '10px' }}>
                      <div
                        id="qr-reader-container"
                        style={{
                          width: '280px',
                          height: '280px',
                          borderRadius: '16px',
                          overflow: 'hidden',
                          border: '3px solid #7C3AED',
                          background: '#000',
                          boxShadow: '0 8px 24px rgba(124, 58, 237, 0.2)'
                        }}
                      />

                      {scannerError && (
                        <div style={{ maxWidth: '380px' }}>
                          <FeedbackBanner type="warning" message={scannerError} />
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => setScannerActive(false)}
                        style={{
                          padding: '8px 18px',
                          borderRadius: '10px',
                          border: '1px solid #DC2626',
                          background: '#FEE2E2',
                          color: '#DC2626',
                          fontWeight: 700,
                          fontSize: '0.84rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <StopCircle size={15} />
                        <span>Close Camera Scanner</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="portal-card" style={{ padding: '24px', textAlign: 'center', background: '#F0FDF4', borderColor: '#86EFAC', marginBottom: '24px' }}>
              <CheckCircle2 size={40} color="#16A34A" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#15803D', fontWeight: 800 }}>
                Your Attendance is Confirmed for Today!
              </h3>
              <p style={{ margin: '6px 0 0', color: '#475569', fontSize: '0.88rem' }}>
                Roll call recorded successfully. You do not need to check in again until tomorrow's session.
              </p>
            </div>
          )}

          {/* Section F: Student Attendance History Table */}
          <div className="portal-card portal-history-section">
            <div className="portal-history-header-row">
              <div>
                <h3 className="portal-history-title">
                  Attendance History
                </h3>
                <p className="portal-history-subtitle">
                  Past roll call verification records and audit events for {studentProfile?.full_name || 'this resident'}
                </p>
              </div>

              <div className="portal-search-input-wrap">
                <Search size={15} className="portal-search-icon" />
                <input
                  type="text"
                  placeholder="Filter records by date or session..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="portal-search-input"
                />
              </div>
            </div>

            <div className="portal-table-container">
              <table className="portal-table">
                <thead>
                  <tr>
                    <th style={{ width: '130px' }}>Date</th>
                    <th style={{ minWidth: '220px' }}>Session / Roll Call</th>
                    <th style={{ width: '120px' }}>Status</th>
                    <th style={{ width: '170px' }}>Verification Method</th>
                    <th style={{ width: '160px' }}>Verified Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.length > 0 ? (
                    filteredHistory.map((rec) => (
                      <tr key={rec.id}>
                        <td style={{ fontWeight: 700, fontSize: '0.86rem', whiteSpace: 'nowrap' }}>
                          {rec.date}
                        </td>
                        <td style={{ fontWeight: 600, color: '#0F172A' }}>
                          {rec.session_title || 'Daily Curfew Roll Call'}
                        </td>
                        <td>
                          <StatusBadge status={rec.status || 'present'} />
                        </td>
                        <td>
                          <span style={{
                            padding: '3px 10px',
                            borderRadius: '6px',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            background: rec.method === 'qr_code' ? '#E0F2FE' : rec.method === 'session_code' ? '#EDE9FE' : rec.method === 'face_verified' ? '#DCFCE7' : '#F1F5F9',
                            color: rec.method === 'qr_code' ? '#0369A1' : rec.method === 'session_code' ? '#7C3AED' : rec.method === 'face_verified' ? '#15803D' : '#475569',
                            whiteSpace: 'nowrap'
                          }}>
                            {rec.method?.replace('_', ' ') || 'Manual Roll Call'}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.84rem', color: '#64748B', whiteSpace: 'nowrap' }}>
                          {rec.verified_at ? new Date(rec.verified_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Regular Call'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '36px 20px', color: '#64748B', fontSize: '0.9rem' }}>
                        No attendance records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: WARDEN ROLL CALL QR GENERATOR
          ========================================================================= */}
      {activeTab === 'warden' && (
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Active Live Session Display (If Running) */}
          {activeSession ? (
            <div className="portal-card" style={{
              border: '2px solid #7C3AED',
              background: '#FFFFFF',
              boxShadow: '0 8px 30px rgba(124, 58, 237, 0.12)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid #E2E8F0', paddingBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      background: '#DC2626',
                      color: '#FFF',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      letterSpacing: '0.5px'
                    }}>
                      LIVE ACTIVE SESSION
                    </span>
                    <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#0F172A' }}>
                      {activeSession.title}
                    </h2>
                  </div>
                  <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '0.86rem' }}>
                    Started by {activeSession.created_by} • Date: {activeSession.date}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Countdown Timer */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '12px',
                    background: sessionRemainingSec <= 120 ? '#FEE2E2' : '#EDE9FE',
                    color: sessionRemainingSec <= 120 ? '#DC2626' : '#7C3AED',
                    fontWeight: 800,
                    fontSize: '1.1rem'
                  }}>
                    <Clock size={18} />
                    <span>{formatCountdown(sessionRemainingSec)}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>remaining</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCloseSession}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '10px',
                      border: '1px solid #DC2626',
                      background: '#FEE2E2',
                      color: '#DC2626',
                      fontWeight: 700,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <StopCircle size={15} />
                    <span>End Session</span>
                  </button>
                </div>
              </div>

              {/* QR Code & 6-Digit PIN Side-by-Side */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '28px',
                marginTop: '24px',
                alignItems: 'center'
              }}>
                {/* QR Display */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <div style={{
                    padding: '16px',
                    borderRadius: '18px',
                    background: '#FFFFFF',
                    border: '2px solid #E2E8F0',
                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.06)'
                  }}>
                    <QRCodeSVG
                      value={qrPayloadString}
                      size={220}
                      bgColor="#FFFFFF"
                      fgColor="#1E1B4B"
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  <span style={{ marginTop: '12px', fontSize: '0.85rem', fontWeight: 600, color: '#64748B' }}>
                    Display to residents on warden projector or mobile
                  </span>
                </div>

                {/* 6-Digit Numeric Fallback PIN */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{
                    padding: '20px',
                    borderRadius: '16px',
                    background: '#F5F3FF',
                    border: '1px solid #DDD6FE'
                  }}>
                    <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700, color: '#64748B', letterSpacing: '0.5px' }}>
                      Universal 6-Digit Session PIN (Offline / Camera Fallback)
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginTop: '12px',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap'
                    }}>
                      <div style={{
                        display: 'flex',
                        gap: '6px'
                      }}>
                        {activeSession.code.split('').map((char, idx) => (
                          <div
                            key={idx}
                            style={{
                              width: '40px',
                              height: '48px',
                              borderRadius: '10px',
                              background: '#FFFFFF',
                              border: '2px solid #8B7AE8',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.45rem',
                              fontWeight: 900,
                              color: '#7C3AED',
                              boxShadow: '0 2px 6px rgba(124, 58, 237, 0.12)'
                            }}
                          >
                            {char}
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className="portal-btn-refresh"
                        style={{ padding: '8px 14px' }}
                      >
                        {copiedCode ? <Check size={14} color="#16A34A" /> : <Copy size={14} />}
                        <span>{copiedCode ? 'Copied' : 'Copy PIN'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Live Progress Bar */}
                  <div style={{
                    padding: '16px',
                    borderRadius: '14px',
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>
                      <span>Live Roll Call Check-Ins</span>
                      <span>{sessionStats.checkedIn} / {sessionStats.total} Students</span>
                    </div>

                    <div style={{
                      width: '100%',
                      height: '8px',
                      borderRadius: '4px',
                      background: '#EDE9FE',
                      marginTop: '8px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${Math.min(100, (sessionStats.checkedIn / Math.max(1, sessionStats.total)) * 100)}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #7C3AED, #10B981)',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Checked-in Students List */}
              {sessionStats.attendees?.length > 0 && (
                <div style={{ marginTop: '24px', borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
                  <h4 style={{ margin: '0 0 10px', fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>
                    Recent Checked-in Residents:
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {sessionStats.attendees.map((att) => (
                      <div
                        key={att.id}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          background: 'rgba(220, 252, 231, 0.75)',
                          border: '1px solid #86EFAC',
                          fontSize: '0.82rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <CheckCircle2 size={13} color="#16A34A" />
                        <span style={{ fontWeight: 700, color: '#15803D' }}>{att.student_name}</span>
                        <span style={{ color: '#64748B', fontSize: '0.76rem' }}>
                          ({att.room_number ? `Rm ${att.room_number}` : formatDisplayId(att.student_id)})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Create Session Generator Form (When No Session Is Active) */
            <div className="portal-card">
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
                  Launch New Roll Call Session
                </h3>
                <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '0.86rem' }}>
                  Generate a time-limited QR code and 6-digit PIN for curfew or assembly roll call.
                </p>
              </div>

              <form onSubmit={handleCreateSession} style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '600px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Session Title</label>
                  <input
                    type="text"
                    value={newSessionTitle}
                    onChange={(e) => setNewSessionTitle(e.target.value)}
                    placeholder="e.g. Evening Curfew Roll Call — 09:30 PM"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.9rem',
                      outline: 'none',
                      background: '#FFFFFF',
                      color: '#0F172A',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Session Type</label>
                    <select
                      value={newSessionType}
                      onChange={(e) => setNewSessionType(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.9rem',
                        outline: 'none',
                        background: '#FFFFFF',
                        color: '#0F172A',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="evening_roll_call">Evening Curfew (09:30 PM)</option>
                      <option value="morning_attendance">Morning Assembly Attendance</option>
                      <option value="special_checkin">Special Event / Weekend Verification</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Session Duration</label>
                    <select
                      value={newSessionDuration}
                      onChange={(e) => setNewSessionDuration(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.9rem',
                        outline: 'none',
                        background: '#FFFFFF',
                        color: '#0F172A',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value={5}>5 Minutes (Quick Verification)</option>
                      <option value={10}>10 Minutes</option>
                      <option value={15}>15 Minutes (Standard Curfew)</option>
                      <option value={30}>30 Minutes (Extended Assembly)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={sessionLoading}
                  className="btn-save-primary"
                  style={{
                    padding: '12px 24px',
                    fontSize: '0.96rem',
                    borderRadius: '12px',
                    marginTop: '8px'
                  }}
                >
                  <PlayCircle size={18} />
                  <span>{sessionLoading ? 'Generating Session...' : 'Generate Live QR & PIN Session'}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: ROLL CALL AUDIT TRAIL
          ========================================================================= */}
      {activeTab === 'audit' && (
        <div style={{ marginTop: '20px' }}>
          <div className="portal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
                  Today's Attendance Audit Trail
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '0.84rem', color: '#64748B' }}>
                  Comprehensive audit logs including verification method, server timestamp, and resident details
                </p>
              </div>

              <button
                type="button"
                onClick={loadAuditLogs}
                className="portal-btn-refresh"
                style={{ padding: '8px 16px' }}
              >
                <RefreshCw size={14} />
                <span>Refresh Logs</span>
              </button>
            </div>

            <div className="portal-table-container">
              <table className="portal-table">
                <thead>
                  <tr>
                    <th style={{ width: '180px' }}>Student</th>
                    <th style={{ width: '110px' }}>Room</th>
                    <th style={{ width: '120px' }}>Status</th>
                    <th style={{ width: '160px' }}>Method</th>
                    <th style={{ minWidth: '180px' }}>Session</th>
                    <th style={{ width: '150px' }}>Verified At</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.length > 0 ? (
                    auditLogs.map((log) => (
                      <tr key={log.id}>
                        <td>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0F172A' }}>
                            {log.student_name}
                          </div>
                          <div style={{ fontSize: '0.76rem', color: '#64748B' }}>
                            {formatDisplayId(log.student_code)}
                          </div>
                        </td>
                        <td style={{ fontWeight: 600, fontSize: '0.86rem' }}>
                          {log.room_number ? `Room ${log.room_number}` : 'N/A'}
                        </td>
                        <td>
                          <StatusBadge status={log.status || 'present'} />
                        </td>
                        <td>
                          <span style={{
                            padding: '3px 10px',
                            borderRadius: '6px',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            background: log.method === 'qr_code'
                              ? '#E0F2FE'
                              : log.method === 'session_code'
                              ? '#EDE9FE'
                              : log.method === 'face_verified'
                              ? '#DCFCE7'
                              : '#F1F5F9',
                            color: log.method === 'qr_code'
                              ? '#0369A1'
                              : log.method === 'session_code'
                              ? '#7C3AED'
                              : log.method === 'face_verified'
                              ? '#15803D'
                              : '#475569',
                            whiteSpace: 'nowrap'
                          }}>
                            {log.method ? log.method.replace('_', ' ') : 'Manual'}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.84rem', color: '#334155' }}>
                          {log.session_title || 'General Roll Call'}
                        </td>
                        <td style={{ fontSize: '0.84rem', color: '#64748B', whiteSpace: 'nowrap' }}>
                          {log.verified_at ? new Date(log.verified_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recorded'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '36px 20px', color: '#64748B', fontSize: '0.9rem' }}>
                        {auditLoading ? 'Loading audit records...' : 'No attendance logs recorded for today yet.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
