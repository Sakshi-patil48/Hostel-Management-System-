import React, { useState, useEffect } from 'react';
import { hostelService } from '../services/hostelService';
import {
  UserMinus, Search, UserCheck, Calendar, Phone, Mail, Award
} from 'lucide-react';

export default function LeavedStudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLeavedStudents = async () => {
    try {
      setLoading(true);
      const res = await hostelService.getStudents({ status: 'leaved', search });
      setStudents(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeavedStudents();
  }, [search]);

  const handleReactivate = async (student) => {
    if (!window.confirm(`Re-activate ${student.full_name} back to active living student status?`)) return;
    try {
      await hostelService.updateStudent(student.id, { ...student, status: 'active' });
      fetchLeavedStudents();
    } catch (err) {
      alert(err.message || 'Error updating student status.');
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Leaved Students & Alumni Registry</h1>
          <p className="page-subtitle">Historical records of residents who have graduated, checked out, or completed their hostel tenure</p>
        </div>
      </div>

      <div className="table-controls-bar">
        <div className="search-input-wrap">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search alumni by name, ID, or course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="glass-table-container">
        <table className="glass-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Full Name</th>
              <th>Graduating Course</th>
              <th>Phone</th>
              <th>Parent / Guardian</th>
              <th>Admission Date</th>
              <th>Status</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center py-6">Loading alumni records...</td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-6">No leaved students found in registry.</td>
              </tr>
            ) : (
              students.map((s) => (
                <tr key={s.id}>
                  <td>
                    <span className="font-mono text-bold">{s.student_id}</span>
                  </td>
                  <td>
                    <strong>{s.full_name}</strong>
                    <div className="text-xs text-muted">{s.email}</div>
                  </td>
                  <td>{s.course}</td>
                  <td>{s.phone}</td>
                  <td>{s.guardian_name} ({s.guardian_phone})</td>
                  <td>{s.admission_date}</td>
                  <td>
                    <span className="status-pill-badge leaved">Checked Out / Alumni</span>
                  </td>
                  <td className="text-right">
                    <button
                      onClick={() => handleReactivate(s)}
                      className="btn-sm-action primary"
                      title="Re-activate Student"
                    >
                      <UserCheck size={14} />
                      <span>Reactivate</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
