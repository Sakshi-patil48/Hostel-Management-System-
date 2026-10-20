import React, { useState, useEffect, useRef, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  QrCode, Camera, ShieldCheck, CheckCircle2, AlertCircle,
  Clock, RefreshCw, Copy, Check, Users, User, Building,
  KeyRound, Calendar, Award, Sparkles, AlertTriangle,
  PlayCircle, StopCircle, ArrowRight, Eye, Info, Search
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { hostelService } from '../services/hostelService';
import FeedbackBanner from '../components/common/FeedbackBanner';
import StatusBadge from '../components/common/StatusBadge';
import MetricCard from '../components/common/MetricCard';

export default function StudentAttendancePortal() {
  const { user: currentUser } = useAuth();
  const isStudentUser = currentUser?.role === 'student' || (!currentUser?.is_staff && currentUser?.student);

  // Active Tab: 'student' (Resident Portal), 'warden' (Session Generator), 'audit' (Audit Log)
  const [activeTab, setActiveTab] = useState(isStudentUser ? 'student' : 'student');

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

  // Check-in Method in Student Portal: 'pin' | 'qr_scan' | 'biometric'
  const [checkInMethod, setCheckInMethod] = useState('pin');
  const [pinCode, setPinCode] = useState('');
  const [submittingCheckIn, setSubmittingCheckIn] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Camera QR Scanner State
  const [scannerActive, setScannerActive] = useState(false);
  const [scannerError, setScannerError] = useState('');
  const html5QrCodeRef = useRef(null);

  // Biometric Framing State (Honest, consent-based presence verification)
  const [biometricStream, setBiometricStream] = useState(null);
  const [biometricActive, setBiometricActive] = useState(false);
  const [biometricVerified, setBiometricVerified] = useState(false);
  const videoRef = useRef(null);

  // PIN Copied notification
  const [copiedCode, setCopiedCode] = useState(false);

  // History Filter
  const [historySearch, setHistorySearch] = useState('');

  // Audit Log State
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);

  // 1. Initial Load: Students list, Current Student Profile, Active Session
  useEffect(() => {
    loadInitialData();
  }, [selectedStudentId]);

  const loadInitialData = async () => {
    try {
      // Load all students for switcher dropdown if staff/preview
      const students = await hostelService.getStudents({ status: 'active' });
      setAllStudentsList(students || []);

      // Load selected student's profile & attendance history
      await loadStudentData(selectedStudentId);

      // Load active warden session
      await checkActiveSession();
    } catch (err) {
      console.error('Error loading attendance portal data:', err);
    }
  };

  const loadStudentData = async (studentId) => {
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
  };

  const checkActiveSession = async () => {
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
  };

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
  }, [activeSession, sessionRemainingSec]);

  // 3. QR Camera Scanner Lifecycle
  useEffect(() => {
    if (checkInMethod === 'qr_scan' && scannerActive) {
      startCameraScanner();
    } else {
      stopCameraScanner();
    }
    return () => {
      stopCameraScanner();
    };
  }, [checkInMethod, scannerActive]);

  const startCameraScanner = async () => {
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
          // Frame scanner searching - ignore frames without QR
        }
      );
    } catch (err) {
      console.warn('Camera scanner initialization error:', err);
      setScannerError('Camera access unavailable or permission denied. You can use the 6-Digit PIN fallback below.');
      setScannerActive(false);
    }
  };

  const stopCameraScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.warn('Error stopping QR scanner:', err);
      }
    }
  };

  const handleQrScanSuccess = async (scannedValue) => {
    // If QR contains JSON or plain token
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

    stopCameraScanner();
    setScannerActive(false);
    await executeCheckIn({ session_token: token, method: 'qr_code' });
  };

  // 4. Biometric Camera Stream Lifecycle
  useEffect(() => {
    if (checkInMethod === 'biometric' && biometricActive) {
      startBiometricCamera();
    } else {
      stopBiometricCamera();
    }
    return () => {
      stopBiometricCamera();
    };
  }, [checkInMethod, biometricActive]);

  const startBiometricCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 480, height: 480 } });
      setBiometricStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Biometric camera access error:', err);
      setFeedback({
        type: 'error',
        message: 'Webcam permission denied or camera unavailable. Please enable camera permissions or use the 6-Digit PIN method.',
      });
      setBiometricActive(false);
    }
  };

  const stopBiometricCamera = () => {
    if (biometricStream) {
      biometricStream.getTracks().forEach((track) => track.stop());
      setBiometricStream(null);
    }
  };

  // 5. Execute Check-In Submission
  const executeCheckIn = async ({ session_token, session_code, method }) => {
    setSubmittingCheckIn(true);
    setFeedback({ type: '', message: '' });

    try {
      const payload = {
        student_id: selectedStudentId,
        method: method || checkInMethod === 'pin' ? 'session_code' : checkInMethod === 'biometric' ? 'face_verified' : 'qr_code',
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
      setBiometricVerified(true);

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
  };

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

  const handleBiometricConfirm = () => {
    executeCheckIn({
      session_code: activeSession?.code || undefined,
      session_token: activeSession?.token || undefined,
      method: 'face_verified',
    });
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
    <div className="page-container animate-fadeIn">
      {/* Page Header */}
      <div className="page-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)',
              color: '#FFFFFF'
            }}>
              <QrCode size={24} />
            </div>
            <div>
              <h1 className="page-title" style={{ margin: 0, fontSize: '1.65rem' }}>
                Student Attendance Portal
              </h1>
              <p className="page-subtitle" style={{ margin: '4px 0 0', color: 'var(--dash-text-secondary)', fontSize: '0.88rem' }}>
                QR Check-in, Time-Limited Roll Call Sessions & Monthly Attendance Analytics
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation Pill Group */}
        <div style={{
          display: 'flex',
          background: 'rgba(237, 233, 254, 0.65)',
          padding: '4px',
          borderRadius: '14px',
          border: '1px solid var(--sidebar-border)',
          gap: '4px'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('student')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'student' ? 'linear-gradient(135deg, #7C3AED, #8B7AE8)' : 'transparent',
              color: activeTab === 'student' ? '#FFFFFF' : 'var(--dash-text-primary)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'student' ? '0 2px 8px rgba(124, 58, 237, 0.28)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <User size={16} />
            <span>Student Self Check-In</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('warden')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'warden' ? 'linear-gradient(135deg, #7C3AED, #8B7AE8)' : 'transparent',
              color: activeTab === 'warden' ? '#FFFFFF' : 'var(--dash-text-primary)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'warden' ? '0 2px 8px rgba(124, 58, 237, 0.28)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <QrCode size={16} />
            <span>Warden Roll Call QR</span>
            {activeSession && (
              <span style={{
                background: '#EF4444',
                color: '#FFF',
                fontSize: '0.68rem',
                padding: '2px 6px',
                borderRadius: '8px',
                marginLeft: '4px',
                fontWeight: 700
              }}>
                LIVE
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'audit' ? 'linear-gradient(135deg, #7C3AED, #8B7AE8)' : 'transparent',
              color: activeTab === 'audit' ? '#FFFFFF' : 'var(--dash-text-primary)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'audit' ? '0 2px 8px rgba(124, 58, 237, 0.28)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <ShieldCheck size={16} />
            <span>Audit Trail</span>
          </button>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedback.message && (
        <div style={{ marginTop: '16px' }}>
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
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Staff Preview Switcher (Only shown if testing or multiple students exist) */}
          <div className="modern-card" style={{ padding: '12px 18px', background: 'rgba(255, 255, 255, 0.85)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="#7C3AED" />
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--dash-text-primary)' }}>
                Viewing Student Profile:
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--sidebar-border)',
                  background: 'var(--dash-white)',
                  color: 'var(--dash-text-primary)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {allStudentsList.map((s) => (
                  <option key={s.id} value={s.student_id}>
                    {s.student_id} — {s.full_name} ({s.current_room ? `Room ${s.current_room}` : 'No Room'})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => loadStudentData(selectedStudentId)}
                title="Refresh Attendance Stats"
                style={{
                  background: 'var(--dash-pale-lavender)',
                  border: '1px solid var(--sidebar-border)',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: 'var(--dash-primary-lavender)',
                  fontSize: '0.82rem'
                }}
              >
                <RefreshCw size={14} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Student Profile Card & Today's Status Banner */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {/* Student Profile Summary */}
            <div className="modern-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #7C3AED, #C4B5FD)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.35rem',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  boxShadow: '0 4px 14px rgba(124, 58, 237, 0.28)'
                }}>
                  {studentProfile?.full_name
                    ? studentProfile.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                    : 'ST'}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--dash-text-primary)' }}>
                    {studentProfile?.full_name || 'Loading Resident...'}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <span style={{
                      background: 'var(--dash-light-lavender)',
                      color: 'var(--dash-vibrant-purple)',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 700
                    }}>
                      {studentProfile?.student_id || selectedStudentId}
                    </span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--dash-text-secondary)' }}>
                      {studentProfile?.course || 'B.Tech CSE'} • {studentProfile?.year_of_study || '2nd Year'}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                padding: '14px',
                borderRadius: '12px',
                background: 'rgba(247, 245, 255, 0.85)',
                border: '1px solid var(--sidebar-border)'
              }}>
                <div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--dash-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Hostel Room
                  </div>
                  <div style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--dash-text-primary)', marginTop: '2px' }}>
                    {studentProfile?.current_room ? `Room ${studentProfile.current_room}` : 'Not Assigned'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--dash-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Bed Allocation
                  </div>
                  <div style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--dash-text-primary)', marginTop: '2px' }}>
                    {studentProfile?.current_bed || 'Pending'}
                  </div>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--dash-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Hostel Block
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--dash-text-primary)', marginTop: '2px' }}>
                    {studentProfile?.block_name || 'Block A (Main Campus Hostel)'}
                  </div>
                </div>
              </div>
            </div>

            {/* Today's Live Attendance Status Card */}
            <div className="modern-card" style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background: todayRecord
                ? 'linear-gradient(135deg, rgba(220, 252, 231, 0.95), rgba(240, 253, 244, 0.95))'
                : 'linear-gradient(135deg, rgba(247, 245, 255, 0.95), rgba(237, 233, 254, 0.95))',
              border: todayRecord ? '1px solid #86EFAC' : '1px solid var(--sidebar-border)',
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--dash-text-secondary)' }}>
                    Today's Curfew Verification
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--dash-text-secondary)' }}>
                    {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                  {todayRecord ? (
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: '#16A34A',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFF',
                      boxShadow: '0 4px 12px rgba(22, 163, 74, 0.35)'
                    }}>
                      <CheckCircle2 size={28} />
                    </div>
                  ) : (
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: '#D97706',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFF',
                      boxShadow: '0 4px 12px rgba(217, 119, 6, 0.3)'
                    }}>
                      <Clock size={26} />
                    </div>
                  )}

                  <div>
                    <h2 style={{
                      margin: 0,
                      fontSize: '1.45rem',
                      color: todayRecord ? '#15803D' : '#92400E',
                      fontWeight: 800
                    }}>
                      {todayRecord ? 'MARKED PRESENT' : 'NOT MARKED YET'}
                    </h2>
                    <p style={{ margin: '4px 0 0', fontSize: '0.86rem', color: 'var(--dash-text-secondary)' }}>
                      {todayRecord
                        ? `Verified at ${todayRecord.verified_at ? new Date(todayRecord.verified_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Roll Call'}`
                        : 'Please scan the warden QR code or enter the 6-digit session PIN below.'}
                    </p>
                  </div>
                </div>
              </div>

              {todayRecord ? (
                <div style={{
                  marginTop: '16px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.84rem'
                }}>
                  <span style={{ color: 'var(--dash-text-secondary)' }}>Method:</span>
                  <span style={{ fontWeight: 700, color: '#15803D', textTransform: 'capitalize' }}>
                    {todayRecord.method?.replace('_', ' ') || 'QR Code Check-in'}
                  </span>
                </div>
              ) : activeSession ? (
                <div style={{
                  marginTop: '16px',
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
                  <span style={{ fontWeight: 700 }}>Code: {activeSession.code}</span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Monthly Statistics Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <MetricCard
              title="Monthly Attendance"
              value={`${attendanceStats?.percentage ?? 100}%`}
              subtitle={`${attendanceStats?.month_name || 'Current Month'} Performance`}
              icon={Award}
              colorClass="purple"
            />
            <MetricCard
              title="Days Present"
              value={`${attendanceStats?.present_days ?? 0} Days`}
              subtitle={`Out of ${attendanceStats?.total_days ?? 0} Total Sessions`}
              icon={CheckCircle2}
              colorClass="green"
            />
            <MetricCard
              title="Days Absent"
              value={`${attendanceStats?.absent_days ?? 0} Days`}
              subtitle="Unexcused Hostel Curfew"
              icon={AlertCircle}
              colorClass="red"
            />
            <MetricCard
              title="Approved Leave"
              value={`${attendanceStats?.leave_days ?? 0} Days`}
              subtitle="Permitted Warden Passes"
              icon={Clock}
              colorClass="blue"
            />
          </div>

          {/* Self Check-in Interactive Box (Only if not marked today) */}
          {!todayRecord ? (
            <div className="modern-card" style={{ padding: '26px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--sidebar-border)', paddingBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--dash-text-primary)' }}>
                    Complete Today's Attendance
                  </h3>
                  <p style={{ margin: '4px 0 0', color: 'var(--dash-text-secondary)', fontSize: '0.86rem' }}>
                    Select your preferred verification method to mark your curfew roll call attendance
                  </p>
                </div>

                {/* Verification Method Subtabs */}
                <div style={{ display: 'flex', gap: '8px', background: 'var(--dash-pale-lavender)', padding: '4px', borderRadius: '10px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setCheckInMethod('pin');
                      setScannerActive(false);
                      setBiometricActive(false);
                    }}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      border: 'none',
                      background: checkInMethod === 'pin' ? '#7C3AED' : 'transparent',
                      color: checkInMethod === 'pin' ? '#FFF' : 'var(--dash-text-primary)',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    6-Digit PIN (Fast)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCheckInMethod('qr_scan');
                      setScannerActive(true);
                      setBiometricActive(false);
                    }}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      border: 'none',
                      background: checkInMethod === 'qr_scan' ? '#7C3AED' : 'transparent',
                      color: checkInMethod === 'qr_scan' ? '#FFF' : 'var(--dash-text-primary)',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Scan QR Camera
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCheckInMethod('biometric');
                      setScannerActive(false);
                      setBiometricActive(true);
                    }}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      border: 'none',
                      background: checkInMethod === 'biometric' ? '#7C3AED' : 'transparent',
                      color: checkInMethod === 'biometric' ? '#FFF' : 'var(--dash-text-primary)',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Biometric Framing (Optional)
                  </button>
                </div>
              </div>

              {/* Method 1: 6-Digit PIN Input */}
              {checkInMethod === 'pin' && (
                <div style={{ marginTop: '24px', maxWidth: '480px', margin: '24px auto 0' }}>
                  <form onSubmit={handlePinSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <label htmlFor="session-pin-input" style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--dash-text-primary)' }}>
                        Enter 6-Digit Session Code Displayed on Warden Screen:
                      </label>
                      <p style={{ margin: '4px 0 16px', fontSize: '0.82rem', color: 'var(--dash-text-secondary)' }}>
                        The warden displays a time-limited 6-digit code for hostel residents.
                      </p>

                      <input
                        id="session-pin-input"
                        type="text"
                        maxLength={6}
                        value={pinCode}
                        onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="e.g. 482195"
                        style={{
                          width: '100%',
                          textAlign: 'center',
                          letterSpacing: '8px',
                          fontSize: '1.8rem',
                          fontWeight: 800,
                          padding: '14px 20px',
                          borderRadius: '14px',
                          border: '2px solid var(--sidebar-border)',
                          background: 'var(--dash-white)',
                          color: '#7C3AED',
                          outline: 'none',
                          boxShadow: '0 4px 12px rgba(124, 58, 237, 0.08)'
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingCheckIn || pinCode.length !== 6}
                      className="btn-save-primary"
                      style={{
                        padding: '14px 24px',
                        fontSize: '1rem',
                        fontWeight: 700,
                        justifyContent: 'center',
                        borderRadius: '12px'
                      }}
                    >
                      {submittingCheckIn ? 'Verifying with Server...' : 'Verify Code & Mark Present'}
                    </button>

                    {activeSession && (
                      <div style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--dash-text-secondary)' }}>
                        <span>Active Session Code: </span>
                        <button
                          type="button"
                          onClick={() => setPinCode(activeSession.code)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#7C3AED',
                            fontWeight: 700,
                            cursor: 'pointer',
                            textDecoration: 'underline'
                          }}
                        >
                          Autofill {activeSession.code}
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              )}

              {/* Method 2: Camera QR Scanner */}
              {checkInMethod === 'qr_scan' && (
                <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div
                    id="qr-reader-container"
                    style={{
                      width: '320px',
                      height: '320px',
                      borderRadius: '18px',
                      overflow: 'hidden',
                      border: '3px solid #7C3AED',
                      background: '#000',
                      boxShadow: '0 8px 24px rgba(124, 58, 237, 0.2)'
                    }}
                  />

                  {scannerError && (
                    <div style={{ marginTop: '16px', maxWidth: '400px' }}>
                      <FeedbackBanner type="warning" message={scannerError} />
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                    {!scannerActive ? (
                      <button
                        type="button"
                        onClick={() => setScannerActive(true)}
                        className="btn-save-primary"
                        style={{ padding: '10px 20px', fontSize: '0.88rem' }}
                      >
                        <Camera size={16} />
                        <span>Start Camera Scanner</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setScannerActive(false)}
                        style={{
                          padding: '10px 20px',
                          borderRadius: '10px',
                          border: '1px solid #DC2626',
                          background: '#FEE2E2',
                          color: '#DC2626',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <StopCircle size={16} />
                        <span>Stop Camera</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Method 3: Biometric Framing (Honest Consent-based) */}
              {checkInMethod === 'biometric' && (
                <div style={{ marginTop: '20px', maxWidth: '520px', margin: '20px auto 0' }}>
                  {/* Transparent Privacy Notice */}
                  <div style={{
                    padding: '14px 18px',
                    borderRadius: '12px',
                    background: 'rgba(237, 233, 254, 0.75)',
                    border: '1px solid var(--sidebar-border)',
                    marginBottom: '18px',
                    fontSize: '0.84rem',
                    color: 'var(--dash-text-primary)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#7C3AED', marginBottom: '4px' }}>
                      <ShieldCheck size={18} />
                      <span>Transparent Biometric Verification</span>
                    </div>
                    <span>
                      Video framing verifies physical student presence during roll call. No permanent facial geometry is recorded or sent to third-party AI services.
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      position: 'relative',
                      width: '300px',
                      height: '300px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '4px solid #7C3AED',
                      background: '#1F1338',
                      boxShadow: '0 8px 24px rgba(124, 58, 237, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{
                        position: 'absolute',
                        inset: '16px',
                        border: '2px dashed rgba(255, 255, 255, 0.7)',
                        borderRadius: '50%',
                        pointerEvents: 'none'
                      }} />
                    </div>

                    <button
                      type="button"
                      onClick={handleBiometricConfirm}
                      disabled={submittingCheckIn}
                      className="btn-save-primary"
                      style={{ padding: '12px 24px', fontSize: '0.95rem', borderRadius: '12px' }}
                    >
                      <CheckCircle2 size={18} />
                      <span>Confirm Live Presence & Check-In</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="modern-card" style={{ padding: '24px', textAlign: 'center', background: 'rgba(220, 252, 231, 0.5)' }}>
              <CheckCircle2 size={40} color="#16A34A" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#15803D' }}>
                Your Attendance is Confirmed for Today!
              </h3>
              <p style={{ margin: '6px 0 0', color: 'var(--dash-text-secondary)', fontSize: '0.88rem' }}>
                Roll call recorded successfully. You do not need to check in again until tomorrow's session.
              </p>
            </div>
          )}

          {/* Student Attendance History Table */}
          <div className="modern-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--dash-text-primary)' }}>
                  Personal Attendance History
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: 'var(--dash-text-secondary)' }}>
                  Verified roll calls and check-in logs for this academic term
                </p>
              </div>

              <div style={{ position: 'relative', width: '240px' }}>
                <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--dash-text-secondary)' }} />
                <input
                  type="text"
                  placeholder="Filter records..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 10px 7px 32px',
                    borderRadius: '8px',
                    border: '1px solid var(--sidebar-border)',
                    fontSize: '0.82rem',
                    background: 'var(--dash-white)',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="modern-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--dash-pale-lavender)', textAlign: 'left', borderBottom: '1px solid var(--sidebar-border)' }}>
                    <th style={{ padding: '10px 14px', fontSize: '0.8rem', color: 'var(--dash-text-secondary)' }}>Date</th>
                    <th style={{ padding: '10px 14px', fontSize: '0.8rem', color: 'var(--dash-text-secondary)' }}>Session / Roll Call</th>
                    <th style={{ padding: '10px 14px', fontSize: '0.8rem', color: 'var(--dash-text-secondary)' }}>Status</th>
                    <th style={{ padding: '10px 14px', fontSize: '0.8rem', color: 'var(--dash-text-secondary)' }}>Verification Method</th>
                    <th style={{ padding: '10px 14px', fontSize: '0.8rem', color: 'var(--dash-text-secondary)' }}>Verified Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.length > 0 ? (
                    filteredHistory.map((rec) => (
                      <tr key={rec.id} style={{ borderBottom: '1px solid var(--sidebar-border)' }}>
                        <td style={{ padding: '12px 14px', fontWeight: 600, fontSize: '0.85rem' }}>
                          {rec.date}
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: '0.85rem' }}>
                          {rec.session_title || 'Daily Curfew Roll Call'}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <StatusBadge status={rec.status || 'present'} />
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: '0.83rem', color: 'var(--dash-text-secondary)', textTransform: 'capitalize' }}>
                          {rec.method?.replace('_', ' ') || 'Manual Roll Call'}
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: 'var(--dash-text-secondary)' }}>
                          {rec.verified_at ? new Date(rec.verified_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Regular Call'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--dash-text-secondary)', fontSize: '0.88rem' }}>
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
            <div className="modern-card" style={{
              padding: '28px',
              border: '2px solid #7C3AED',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(247, 245, 255, 0.98))',
              boxShadow: '0 8px 28px rgba(124, 58, 237, 0.16)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--sidebar-border)', paddingBottom: '16px' }}>
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
                    <h2 style={{ margin: 0, fontSize: '1.35rem', color: 'var(--dash-text-primary)' }}>
                      {activeSession.title}
                    </h2>
                  </div>
                  <p style={{ margin: '4px 0 0', color: 'var(--dash-text-secondary)', fontSize: '0.86rem' }}>
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
                    background: sessionRemainingSec <= 120 ? '#FEE2E2' : 'var(--dash-light-lavender)',
                    color: sessionRemainingSec <= 120 ? '#DC2626' : '#7C3AED',
                    fontWeight: 800,
                    fontSize: '1.1rem'
                  }}>
                    <Clock size={18} />
                    <span>{formatCountdown(sessionRemainingSec)}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--dash-text-secondary)' }}>remaining</span>
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
                    border: '2px solid var(--sidebar-border)',
                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.08)'
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
                  <span style={{ marginTop: '12px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--dash-text-secondary)' }}>
                    Display to residents on warden projector or mobile
                  </span>
                </div>

                {/* 6-Digit Numeric Fallback PIN */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{
                    padding: '20px',
                    borderRadius: '16px',
                    background: 'var(--dash-pale-lavender)',
                    border: '1px solid var(--sidebar-border)'
                  }}>
                    <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--dash-text-secondary)', letterSpacing: '0.5px' }}>
                      Universal 6-Digit Session PIN (Offline / Camera Fallback)
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginTop: '12px',
                      justifyContent: 'space-between'
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
                        style={{
                          background: '#FFFFFF',
                          border: '1px solid var(--sidebar-border)',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: '#7C3AED',
                          fontWeight: 600,
                          fontSize: '0.82rem'
                        }}
                      >
                        {copiedCode ? <Check size={14} color="#16A34A" /> : <Copy size={14} />}
                        <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Live Progress Bar */}
                  <div style={{
                    padding: '16px',
                    borderRadius: '14px',
                    background: '#FFFFFF',
                    border: '1px solid var(--sidebar-border)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, color: 'var(--dash-text-primary)' }}>
                      <span>Live Roll Call Check-Ins</span>
                      <span>{sessionStats.checkedIn} / {sessionStats.total} Students</span>
                    </div>

                    <div style={{
                      width: '100%',
                      height: '8px',
                      borderRadius: '4px',
                      background: 'var(--dash-light-lavender)',
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
                <div style={{ marginTop: '24px', borderTop: '1px solid var(--sidebar-border)', paddingTop: '16px' }}>
                  <h4 style={{ margin: '0 0 10px', fontSize: '0.95rem', color: 'var(--dash-text-primary)' }}>
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
                        <span style={{ color: 'var(--dash-text-secondary)', fontSize: '0.76rem' }}>
                          ({att.room_number ? `Rm ${att.room_number}` : att.student_id})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Create Session Generator Form (When No Session Is Active) */
            <div className="modern-card" style={{ padding: '28px' }}>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--dash-text-primary)' }}>
                  Launch New Roll Call Session
                </h3>
                <p style={{ margin: '4px 0 0', color: 'var(--dash-text-secondary)', fontSize: '0.86rem' }}>
                  Generate a time-limited QR code and 6-digit PIN for curfew or assembly roll call.
                </p>
              </div>

              <form onSubmit={handleCreateSession} style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '600px' }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 600 }}>Session Title</label>
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
                      border: '1px solid var(--sidebar-border)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      background: 'var(--dash-white)'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label className="form-label" style={{ fontWeight: 600 }}>Session Type</label>
                    <select
                      value={newSessionType}
                      onChange={(e) => setNewSessionType(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid var(--sidebar-border)',
                        fontSize: '0.9rem',
                        outline: 'none',
                        background: 'var(--dash-white)'
                      }}
                    >
                      <option value="evening_roll_call">Evening Curfew (09:30 PM)</option>
                      <option value="morning_attendance">Morning Assembly Attendance</option>
                      <option value="special_checkin">Special Event / Weekend Verification</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label" style={{ fontWeight: 600 }}>Session Duration</label>
                    <select
                      value={newSessionDuration}
                      onChange={(e) => setNewSessionDuration(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid var(--sidebar-border)',
                        fontSize: '0.9rem',
                        outline: 'none',
                        background: 'var(--dash-white)'
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
          <div className="modern-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--dash-text-primary)' }}>
                  Today's Attendance Audit Trail
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.84rem', color: 'var(--dash-text-secondary)' }}>
                  Comprehensive audit logs including verification method, server timestamp, and resident details
                </p>
              </div>

              <button
                type="button"
                onClick={loadAuditLogs}
                style={{
                  background: 'var(--dash-pale-lavender)',
                  border: '1px solid var(--sidebar-border)',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'var(--dash-primary-lavender)',
                  fontSize: '0.84rem',
                  fontWeight: 600
                }}
              >
                <RefreshCw size={14} />
                <span>Refresh Logs</span>
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="modern-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--dash-pale-lavender)', textAlign: 'left', borderBottom: '1px solid var(--sidebar-border)' }}>
                    <th style={{ padding: '10px 14px', fontSize: '0.8rem', color: 'var(--dash-text-secondary)' }}>Student</th>
                    <th style={{ padding: '10px 14px', fontSize: '0.8rem', color: 'var(--dash-text-secondary)' }}>Room</th>
                    <th style={{ padding: '10px 14px', fontSize: '0.8rem', color: 'var(--dash-text-secondary)' }}>Status</th>
                    <th style={{ padding: '10px 14px', fontSize: '0.8rem', color: 'var(--dash-text-secondary)' }}>Method</th>
                    <th style={{ padding: '10px 14px', fontSize: '0.8rem', color: 'var(--dash-text-secondary)' }}>Session</th>
                    <th style={{ padding: '10px 14px', fontSize: '0.8rem', color: 'var(--dash-text-secondary)' }}>Verified At</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.length > 0 ? (
                    auditLogs.map((log) => (
                      <tr key={log.id} style={{ borderBottom: '1px solid var(--sidebar-border)' }}>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--dash-text-primary)' }}>
                            {log.student_name}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--dash-text-secondary)' }}>
                            {log.student_code}
                          </div>
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: '0.85rem' }}>
                          {log.room_number ? `Room ${log.room_number}` : 'N/A'}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <StatusBadge status={log.status || 'present'} />
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{
                            padding: '3px 8px',
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
                              : 'var(--dash-pale-lavender)',
                            color: log.method === 'qr_code'
                              ? '#0369A1'
                              : log.method === 'session_code'
                              ? '#7C3AED'
                              : log.method === 'face_verified'
                              ? '#15803D'
                              : 'var(--dash-text-secondary)'
                          }}>
                            {log.method ? log.method.replace('_', ' ') : 'Manual'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: '0.83rem', color: 'var(--dash-text-secondary)' }}>
                          {log.session_title || 'General Roll Call'}
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: 'var(--dash-text-secondary)' }}>
                          {log.verified_at ? new Date(log.verified_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recorded'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--dash-text-secondary)', fontSize: '0.88rem' }}>
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
