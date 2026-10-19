import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hostelService } from '../services/hostelService';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import {
  Users, Search, Filter, Edit2, Trash2, Eye,
  UserPlus, Bed, Phone, Mail, CheckCircle, AlertCircle
} from 'lucide-react';

export default function ManageStudents() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');

  // Modals
  const [activeStudent, setActiveStudent] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Edit Form
  const [editFormData, setEditFormData] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await hostelService.getStudents({
        search,
        status: statusFilter,
        course: courseFilter,
      });
      setStudents(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search, statusFilter, courseFilter]);

  const handleOpenEdit = (student) => {
    setActiveStudent(student);
    setEditFormData({
      student_id: student.student_id,
      full_name: student.full_name,
      email: student.email,
      phone: student.phone,
      guardian_name: student.guardian_name,
      guardian_phone: student.guardian_phone,
      address: student.address || '',
      course: student.course,
      year_of_study: student.year_of_study,
      status: student.status,
    });
    setFormError('');
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setFormError('');
    try {
      await hostelService.updateStudent(activeStudent.id, editFormData);
      setShowEditModal(false);
      fetchStudents();
    } catch (err) {
      setFormError(err.message || 'Error updating student record.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!activeStudent) return;
    setActionLoading(true);
    try {
      await hostelService.deleteStudent(activeStudent.id);
      setShowDeleteModal(false);
      fetchStudents();
    } catch (err) {
      alert(err.message || 'Cannot delete student.');
      setShowDeleteModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Update & Delete Students</h1>
          <p className="page-subtitle">View, edit, search, and manage resident student profiles</p>
        </div>
        <button onClick={() => navigate('/dashboard/new-student')} className="btn-primary-action">
          <UserPlus size={16} />
          <span>New Student</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="table-controls-bar">
        <div className="search-input-wrap">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by student ID, name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filters-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Resident Statuses</option>
            <option value="active">Living in Hostel</option>
            <option value="leaved">Leaved / Alumni</option>
            <option value="suspended">Suspended</option>
          </select>

          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Courses</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Information Tech">Information Tech</option>
            <option value="Mechanical">Mechanical</option>
            <option value="Civil">Civil</option>
            <option value="MCA">MCA</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-table-container">
        <table className="glass-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Full Name</th>
              <th>Course & Year</th>
              <th>Phone</th>
              <th>Assigned Room / Bed</th>
              <th>Status</th>
              <th>Fee Due</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center py-6">Loading student records...</td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-6">No students found matching your search.</td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.id}>
                  <td>
                    <span className="font-mono text-bold">{student.student_id}</span>
                  </td>
                  <td>
                    <strong>{student.full_name}</strong>
                    <div className="text-xs text-muted">{student.email}</div>
                  </td>
                  <td>
                    <div>{student.course}</div>
                    <span className="text-xs text-muted">{student.year_of_study}</span>
                  </td>
                  <td>{student.phone}</td>
                  <td>
                    {student.current_room ? (
                      <span className="room-bed-badge">
                        Room {student.current_room} ({student.current_bed})
                      </span>
                    ) : (
                      <span className="text-xs text-amber-500 italic">Not Allocated</span>
                    )}
                  </td>
                  <td>
                    <span className={`status-pill-badge ${student.status}`}>
                      {student.status === 'active' ? 'Living' : student.status}
                    </span>
                  </td>
                  <td>
                    {student.total_fee_due > 0 ? (
                      <span className="text-red-500 font-semibold">₹ {student.total_fee_due.toLocaleString()}</span>
                    ) : (
                      <span className="text-green-600 text-xs font-semibold">No Dues</span>
                    )}
                  </td>
                  <td className="text-right">
                    <div className="row-action-btns">
                      <button
                        onClick={() => { setActiveStudent(student); setShowViewModal(true); }}
                        className="btn-row-action view"
                        title="View Full Profile"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(student)}
                        className="btn-row-action edit"
                        title="Update Student"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => { setActiveStudent(student); setShowDeleteModal(true); }}
                        className="btn-row-action delete"
                        title="Delete Student"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* View Student Profile Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title={`Student Profile — ${activeStudent?.full_name}`}
      >
        {activeStudent && (
          <div className="student-profile-view">
            <div className="profile-top-card">
              <div className="profile-avatar">
                {activeStudent.full_name.charAt(0)}
              </div>
              <div className="profile-titles">
                <h2>{activeStudent.full_name}</h2>
                <span>Student ID: <code>{activeStudent.student_id}</code></span>
                <span className={`status-pill-badge ${activeStudent.status} mt-1`}>
                  {activeStudent.status === 'active' ? 'Living in Hostel' : activeStudent.status}
                </span>
              </div>
            </div>

            <div className="profile-detail-grid">
              <div className="p-item">
                <span className="p-lbl">Course & Specialization</span>
                <strong>{activeStudent.course}</strong>
              </div>
              <div className="p-item">
                <span className="p-lbl">Year of Study</span>
                <strong>{activeStudent.year_of_study}</strong>
              </div>
              <div className="p-item">
                <span className="p-lbl">Contact Email</span>
                <strong>{activeStudent.email}</strong>
              </div>
              <div className="p-item">
                <span className="p-lbl">Contact Phone</span>
                <strong>{activeStudent.phone}</strong>
              </div>
              <div className="p-item">
                <span className="p-lbl">Parent / Guardian</span>
                <strong>{activeStudent.guardian_name}</strong>
              </div>
              <div className="p-item">
                <span className="p-lbl">Guardian Emergency Phone</span>
                <strong>{activeStudent.guardian_phone}</strong>
              </div>
              <div className="p-item full-width">
                <span className="p-lbl">Permanent Address</span>
                <span>{activeStudent.address || 'Address not registered.'}</span>
              </div>
              <div className="p-item full-width">
                <span className="p-lbl">Hostel Room Allotment</span>
                <strong>
                  {activeStudent.current_room
                    ? `Allocated to Room ${activeStudent.current_room} (${activeStudent.current_bed})`
                    : 'Currently not allocated to any bed.'}
                </strong>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Student Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`Edit Student — ${activeStudent?.full_name}`}
      >
        <form onSubmit={handleSaveEdit} className="modal-form">
          {formError && (
            <div className="form-error-banner">
              <AlertCircle size={16} />
              <span>{formError}</span>
            </div>
          )}

          <div className="form-row-2">
            <div className="modal-form-group">
              <label>Full Name</label>
              <input
                type="text"
                required
                value={editFormData.full_name || ''}
                onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
              />
            </div>
            <div className="modal-form-group">
              <label>Email Address</label>
              <input
                type="email"
                required
                value={editFormData.email || ''}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="modal-form-group">
              <label>Phone Number</label>
              <input
                type="text"
                required
                value={editFormData.phone || ''}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
              />
            </div>
            <div className="modal-form-group">
              <label>Resident Status</label>
              <select
                value={editFormData.status || 'active'}
                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
              >
                <option value="active">Living in Hostel</option>
                <option value="leaved">Leaved / Alumni</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div className="form-row-2">
            <div className="modal-form-group">
              <label>Course</label>
              <input
                type="text"
                value={editFormData.course || ''}
                onChange={(e) => setEditFormData({ ...editFormData, course: e.target.value })}
              />
            </div>
            <div className="modal-form-group">
              <label>Year of Study</label>
              <input
                type="text"
                value={editFormData.year_of_study || ''}
                onChange={(e) => setEditFormData({ ...editFormData, year_of_study: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="modal-form-group">
              <label>Guardian Name</label>
              <input
                type="text"
                value={editFormData.guardian_name || ''}
                onChange={(e) => setEditFormData({ ...editFormData, guardian_name: e.target.value })}
              />
            </div>
            <div className="modal-form-group">
              <label>Guardian Phone</label>
              <input
                type="text"
                value={editFormData.guardian_phone || ''}
                onChange={(e) => setEditFormData({ ...editFormData, guardian_phone: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-form-group">
            <label>Permanent Address</label>
            <textarea
              rows="2"
              value={editFormData.address || ''}
              onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
            />
          </div>

          <div className="modal-form-actions">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="btn-modal-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="btn-modal-confirm btn-primary"
            >
              {actionLoading ? 'Saving Changes...' : 'Save Student Details'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Safe Delete Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        isDanger={true}
        title={`Delete Student ${activeStudent?.full_name}?`}
        message={`Are you sure you want to delete ${activeStudent?.full_name} (${activeStudent?.student_id})? Note: If they currently have an active room allocation, the system will prevent deletion until the bed is checked out.`}
        confirmText="Delete Student"
        loading={actionLoading}
      />
    </div>
  );
}
