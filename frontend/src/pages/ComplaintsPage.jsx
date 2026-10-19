import React, { useState, useEffect } from 'react';
import { hostelService } from '../services/hostelService';
import Modal from '../components/Modal';
import {
  AlertOctagon, Plus, Search, Filter, CheckCircle2,
  Clock, Wrench, AlertTriangle, Eye, Edit3
} from 'lucide-react';

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');

  // Modals
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [activeComplaint, setActiveComplaint] = useState(null);

  // New Complaint Form
  const [newForm, setNewForm] = useState({
    student_name: 'Aarav Sharma',
    room_number: '101',
    category: 'electricity',
    priority: 'medium',
    title: '',
    description: '',
  });

  // Update Status Form
  const [updateForm, setUpdateForm] = useState({
    status: 'in_progress',
    resolution_notes: '',
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await hostelService.getComplaints({
        status: statusFilter,
        category: categoryFilter,
        search,
      });
      setComplaints(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, categoryFilter, search]);

  const handleOpenSubmit = () => {
    setNewForm({
      student_name: 'Resident Student',
      room_number: '',
      category: 'electricity',
      priority: 'medium',
      title: '',
      description: '',
    });
    setFormError('');
    setShowSubmitModal(true);
  };

  const handleSubmitNew = async (e) => {
    e.preventDefault();
    if (!newForm.title.trim() || !newForm.description.trim()) {
      setFormError('Please provide both ticket title and detailed description.');
      return;
    }
    setActionLoading(true);
    setFormError('');
    try {
      await hostelService.createComplaint(newForm);
      setShowSubmitModal(false);
      fetchComplaints();
    } catch (err) {
      setFormError(err.message || 'Error submitting complaint ticket.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenUpdate = (complaint) => {
    setActiveComplaint(complaint);
    setUpdateForm({
      status: complaint.status,
      resolution_notes: complaint.resolution_notes || '',
    });
    setFormError('');
    setShowUpdateModal(true);
  };

  const handleSaveUpdate = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setFormError('');
    try {
      await hostelService.updateComplaint(activeComplaint.id, {
        status: updateForm.status,
        resolution_notes: updateForm.resolution_notes,
        resolved_at: updateForm.status === 'resolved' ? new Date().toISOString() : null,
      });
      setShowUpdateModal(false);
      fetchComplaints();
    } catch (err) {
      setFormError(err.message || 'Error updating ticket status.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Complaints & Maintenance Tickets</h1>
          <p className="page-subtitle">Resident facility complaints, technician assignments, and repair resolution log</p>
        </div>
        <button onClick={handleOpenSubmit} className="btn-primary-action">
          <Plus size={16} />
          <span>Lodge Complaint</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="table-controls-bar">
        <div className="search-input-wrap">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search tickets by title, student, or room..."
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
            <option value="">All Ticket Statuses</option>
            <option value="pending">Pending / Under Review</option>
            <option value="in_progress">Technician Assigned</option>
            <option value="resolved">Resolved & Closed</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Categories</option>
            <option value="electricity">Electrical / Power</option>
            <option value="plumbing">Water & Plumbing</option>
            <option value="carpentry">Carpentry & Furniture</option>
            <option value="cleaning">Cleanliness & Hygiene</option>
            <option value="wifi">Wi-Fi & Internet</option>
            <option value="mess">Mess & Dining</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-table-container">
        <table className="glass-table">
          <thead>
            <tr>
              <th>Ticket Title</th>
              <th>Category</th>
              <th>Room</th>
              <th>Resident</th>
              <th>Priority</th>
              <th>Date Lodged</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center py-6">Loading maintenance tickets...</td>
              </tr>
            ) : complaints.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-6">No complaints found. All facilities running smoothly!</td>
              </tr>
            ) : (
              complaints.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.title}</strong>
                    <div className="text-xs text-muted">{c.description?.substring(0, 75)}...</div>
                  </td>
                  <td>
                    <span className="category-pill">{c.category}</span>
                  </td>
                  <td>
                    <span className="room-code-badge">Room {c.room_number || 'N/A'}</span>
                  </td>
                  <td>{c.student_name}</td>
                  <td>
                    <span className={`badge-priority ${c.priority}`}>{c.priority}</span>
                  </td>
                  <td>{c.submission_date}</td>
                  <td>
                    <span className={`status-pill-badge ${c.status}`}>
                      {c.status === 'in_progress' ? 'In Progress' : c.status === 'resolved' ? 'Resolved' : 'Pending'}
                    </span>
                  </td>
                  <td className="text-right">
                    <button
                      onClick={() => handleOpenUpdate(c)}
                      className="btn-sm-action primary"
                      title="Update Ticket Status"
                    >
                      <Edit3 size={13} />
                      <span>Update Status</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Submit New Complaint Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Lodge Maintenance / Facility Ticket"
      >
        <form onSubmit={handleSubmitNew} className="modal-form">
          {formError && (
            <div className="form-error-banner">
              <AlertTriangle size={16} />
              <span>{formError}</span>
            </div>
          )}

          <div className="form-row-2">
            <div className="modal-form-group">
              <label>Resident Full Name *</label>
              <input
                type="text"
                required
                value={newForm.student_name}
                onChange={(e) => setNewForm({ ...newForm, student_name: e.target.value })}
              />
            </div>
            <div className="modal-form-group">
              <label>Hostel Room Number *</label>
              <input
                type="text"
                required
                value={newForm.room_number}
                onChange={(e) => setNewForm({ ...newForm, room_number: e.target.value })}
                placeholder="e.g. 102 or B-201"
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="modal-form-group">
              <label>Issue Category</label>
              <select
                value={newForm.category}
                onChange={(e) => setNewForm({ ...newForm, category: e.target.value })}
              >
                <option value="electricity">Electrical / Power Failure</option>
                <option value="plumbing">Water Supply & Plumbing</option>
                <option value="carpentry">Furniture & Carpentry</option>
                <option value="cleaning">Cleanliness & Sanitation</option>
                <option value="wifi">Wi-Fi & Internet</option>
                <option value="mess">Mess & Food Quality</option>
                <option value="other">Other Facilities</option>
              </select>
            </div>

            <div className="modal-form-group">
              <label>Urgency Level</label>
              <select
                value={newForm.priority}
                onChange={(e) => setNewForm({ ...newForm, priority: e.target.value })}
              >
                <option value="low">Low (Non-urgent)</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent / Emergency</option>
              </select>
            </div>
          </div>

          <div className="modal-form-group">
            <label>Ticket Summary / Title *</label>
            <input
              type="text"
              required
              value={newForm.title}
              onChange={(e) => setNewForm({ ...newForm, title: e.target.value })}
              placeholder="e.g. Geyser switch malfunctioning"
            />
          </div>

          <div className="modal-form-group">
            <label>Detailed Description *</label>
            <textarea
              rows="3"
              required
              value={newForm.description}
              onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
              placeholder="Explain the issue in detail..."
            />
          </div>

          <div className="modal-form-actions">
            <button
              type="button"
              onClick={() => setShowSubmitModal(false)}
              className="btn-modal-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="btn-modal-confirm btn-primary"
            >
              {actionLoading ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Update Complaint Status Modal */}
      <Modal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        title={`Update Ticket — ${activeComplaint?.title}`}
      >
        <form onSubmit={handleSaveUpdate} className="modal-form">
          {formError && (
            <div className="form-error-banner">
              <AlertTriangle size={16} />
              <span>{formError}</span>
            </div>
          )}

          <div className="modal-info-strip">
            <div><strong>Room:</strong> {activeComplaint?.room_number} | <strong>Lodged By:</strong> {activeComplaint?.student_name}</div>
            <div className="mt-1"><strong>Description:</strong> {activeComplaint?.description}</div>
          </div>

          <div className="modal-form-group mt-4">
            <label>Ticket Status</label>
            <select
              value={updateForm.status}
              onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
            >
              <option value="pending">Pending Review</option>
              <option value="in_progress">Technician Assigned / Work in Progress</option>
              <option value="resolved">Resolved & Closed</option>
            </select>
          </div>

          <div className="modal-form-group">
            <label>Technician Resolution Notes / Action Taken</label>
            <textarea
              rows="3"
              value={updateForm.resolution_notes}
              onChange={(e) => setUpdateForm({ ...updateForm, resolution_notes: e.target.value })}
              placeholder="e.g. Electrician Mohan Lal replaced the socket switch on Oct 19."
            />
          </div>

          <div className="modal-form-actions">
            <button
              type="button"
              onClick={() => setShowUpdateModal(false)}
              className="btn-modal-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="btn-modal-confirm btn-primary"
            >
              {actionLoading ? 'Updating...' : 'Update Ticket'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
