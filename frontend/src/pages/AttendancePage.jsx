import React, { useState, useEffect } from 'react';
import { hostelService } from '../services/hostelService';
import { CheckCircle2, Save } from 'lucide-react';

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchAttendanceForDate = async () => {
    try {
      setLoading(true);
      setMessage('');
      const [studentsRes, attRes] = await Promise.all([
        hostelService.getStudents({ status: 'active' }),
        hostelService.getAttendance({ date: selectedDate })
      ]);
      setStudents(studentsRes);

      // Map existing records by student id
      const mapping = {};
      attRes.forEach((rec) => {
        mapping[rec.student] = { status: rec.status, remarks: rec.remarks || '' };
      });

      // Default missing students to 'present'
      studentsRes.forEach((s) => {
        if (!mapping[s.id]) {
          mapping[s.id] = { status: 'present', remarks: '' };
        }
      });

      setAttendanceMap(mapping);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceForDate();
  }, [selectedDate]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: { ...(prev[studentId] || {}), status }
    }));
  };

  const handleRemarksChange = (studentId, remarks) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: { ...(prev[studentId] || {}), remarks }
    }));
  };

  const handleMarkAll = (status) => {
    const updated = { ...attendanceMap };
    students.forEach((s) => {
      updated[s.id] = { ...(updated[s.id] || {}), status };
    });
    setAttendanceMap(updated);
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    setMessage('');
    try {
      const records = students.map((s) => ({
        student_id: s.id,
        status: attendanceMap[s.id]?.status || 'present',
        remarks: attendanceMap[s.id]?.remarks || '',
      }));

      await hostelService.markAttendanceBulk(records, selectedDate);
      setMessage(`Successfully saved attendance for ${selectedDate}!`);
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      alert(err.message || 'Error saving attendance.');
    } finally {
      setSaving(false);
    }
  };

  // Summary counts
  const total = students.length;
  let presentCount = 0;
  let absentCount = 0;
  let leaveCount = 0;

  Object.values(attendanceMap).forEach((val) => {
    if (val.status === 'present') presentCount++;
    else if (val.status === 'absent') absentCount++;
    else if (val.status === 'on_leave') leaveCount++;
  });

  const presentRate = total > 0 ? Math.round((presentCount / total) * 100) : 100;

  return (
    <div className="page-wrapper">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Daily Resident Attendance & Roll Call</h1>
          <p className="page-subtitle">Mark and verify night roll-call attendance for all active hostel residents</p>
        </div>
        <button
          onClick={handleSaveAttendance}
          disabled={saving || loading}
          className="btn-primary-action btn-save-att"
        >
          <Save size={16} />
          <span>{saving ? 'Saving...' : 'Save Roll Call'}</span>
        </button>
      </div>

      {message && (
        <div className="form-success-banner mb-4">
          <CheckCircle2 size={18} />
          <span>{message}</span>
        </div>
      )}

      {/* Date Picker & Fast Action Strip */}
      <div className="attendance-controls-strip">
        <div className="date-picker-wrap">
          <label>Attendance Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="att-date-input"
          />
        </div>

        <div className="fast-mark-btns">
          <span>Quick Mark All:</span>
          <button onClick={() => handleMarkAll('present')} className="btn-mark-fast green">All Present</button>
          <button onClick={() => handleMarkAll('absent')} className="btn-mark-fast red">All Absent</button>
        </div>

        <div className="att-stats-summary">
          <span className="att-stat-pill green">Present: {presentCount}</span>
          <span className="att-stat-pill red">Absent: {absentCount}</span>
          <span className="att-stat-pill amber">Leave: {leaveCount}</span>
          <span className="att-stat-pill blue">Rate: {presentRate}%</span>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="glass-table-container">
        <table className="glass-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Student Name</th>
              <th>Room & Bed</th>
              <th>Course / Year</th>
              <th>Roll Call Status</th>
              <th>Remarks / Note</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-6">Loading resident roll call...</td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-6">No active residents found in hostel.</td>
              </tr>
            ) : (
              students.map((s) => {
                const currentStatus = attendanceMap[s.id]?.status || 'present';
                const currentRemarks = attendanceMap[s.id]?.remarks || '';

                return (
                  <tr key={s.id}>
                    <td>
                      <span className="font-mono text-bold">{s.student_id}</span>
                    </td>
                    <td>
                      <strong>{s.full_name}</strong>
                    </td>
                    <td>
                      {s.current_room ? (
                        <span className="room-bed-badge">Room {s.current_room} ({s.current_bed})</span>
                      ) : (
                        <span className="text-xs text-muted">Unassigned</span>
                      )}
                    </td>
                    <td>{s.course} ({s.year_of_study})</td>
                    <td>
                      <div className="att-status-selector">
                        <button
                          type="button"
                          className={`btn-att-choice ${currentStatus === 'present' ? 'active-present' : ''}`}
                          onClick={() => handleStatusChange(s.id, 'present')}
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          className={`btn-att-choice ${currentStatus === 'absent' ? 'active-absent' : ''}`}
                          onClick={() => handleStatusChange(s.id, 'absent')}
                        >
                          Absent
                        </button>
                        <button
                          type="button"
                          className={`btn-att-choice ${currentStatus === 'on_leave' ? 'active-leave' : ''}`}
                          onClick={() => handleStatusChange(s.id, 'on_leave')}
                        >
                          On Leave
                        </button>
                      </div>
                    </td>
                    <td>
                      <input
                        type="text"
                        placeholder="Optional remarks (e.g. sick leave, library pass)"
                        value={currentRemarks}
                        onChange={(e) => handleRemarksChange(s.id, e.target.value)}
                        className="att-remarks-input"
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
