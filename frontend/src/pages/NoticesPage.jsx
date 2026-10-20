import React, { useState, useEffect } from 'react';
import { hostelService } from '../services/hostelService';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import {
  Plus, Edit2, Trash2, Calendar, User, AlertCircle
} from 'lucide-react';

export default function NoticesPage() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeNotice, setActiveNotice] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    author: 'Office of Chief Warden',
    priority: 'normal',
    audience: 'all',
    is_published: true,
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await hostelService.getNotices();
      setNotices(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      title: '',
      description: '',
      author: 'Office of Chief Warden',
      priority: 'normal',
      audience: 'all',
      is_published: true,
    });
    setFormError('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (notice) => {
    setActiveNotice(notice);
    setFormData({
      title: notice.title,
      description: notice.description,
      author: notice.author,
      priority: notice.priority,
      audience: notice.audience,
      is_published: notice.is_published,
    });
    setFormError('');
    setShowEditModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      setFormError('Notice title and description are required.');
      return;
    }

    setActionLoading(true);
    setFormError('');
    try {
      if (showAddModal) {
        await hostelService.createNotice(formData);
      } else {
        await hostelService.updateNotice(activeNotice.id, formData);
      }
      setShowAddModal(false);
      setShowEditModal(false);
      fetchNotices();
    } catch (err) {
      setFormError(err.message || 'Error publishing notice.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!activeNotice) return;
    setActionLoading(true);
    try {
      await hostelService.deleteNotice(activeNotice.id);
      setShowDeleteModal(false);
      fetchNotices();
    } catch (err) {
      alert(err.message || 'Error deleting notice.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Notices & Campus Announcements</h1>
          <p className="page-subtitle">Publish circulars, dining schedules, events, and maintenance announcements for hostel residents</p>
        </div>
        <button onClick={handleOpenAdd} className="btn-primary-action">
          <Plus size={16} />
          <span>Publish New Notice</span>
        </button>
      </div>

      {/* Notices Grid */}
      <div className="notices-cards-grid">
        {loading ? (
          <div className="col-span-full text-center py-8">Loading announcements...</div>
        ) : notices.length === 0 ? (
          <div className="col-span-full text-center py-8">No notices published yet.</div>
        ) : (
          notices.map((n) => (
            <div key={n.id} className="notice-glass-card">
              <div className="notice-card-top">
                <div className="notice-badges">
                  <span className={`notice-tag ${n.priority}`}>{n.priority}</span>
                  <span className="notice-aud-tag">Target: {n.audience?.replace('_', ' ')}</span>
                </div>
                <div className="notice-actions-strip">
                  <button onClick={() => handleOpenEdit(n)} className="btn-icon-subtle" title="Edit Notice">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => { setActiveNotice(n); setShowDeleteModal(true); }} className="btn-icon-subtle danger" title="Delete Notice">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <h2 className="notice-headline">{n.title}</h2>
              <p className="notice-body-txt">{n.description}</p>

              <div className="notice-card-footer">
                <div className="notice-meta-item">
                  <User size={13} />
                  <span>{n.author}</span>
                </div>
                <div className="notice-meta-item">
                  <Calendar size={13} />
                  <span>{n.publication_date}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={showAddModal || showEditModal}
        onClose={() => { setShowAddModal(false); setShowEditModal(false); }}
        title={showAddModal ? "Publish Campus Notice" : "Edit Notice"}
      >
        <form onSubmit={handleSave} className="modal-form">
          {formError && (
            <div className="form-error-banner">
              <AlertCircle size={16} />
              <span>{formError}</span>
            </div>
          )}

          <div className="modal-form-group">
            <label>Notice Headline / Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Revised Mess Menu & Dining Timings"
            />
          </div>

          <div className="form-row-3">
            <div className="modal-form-group">
              <label>Publishing Authority</label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              />
            </div>
            <div className="modal-form-group">
              <label>Priority Level</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="low">General (Low)</option>
                <option value="normal">Important (Normal)</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent Announcement</option>
              </select>
            </div>
            <div className="modal-form-group">
              <label>Target Audience</label>
              <select
                value={formData.audience}
                onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
              >
                <option value="all">All Hostel Residents</option>
                <option value="block_a">Block A Only</option>
                <option value="block_b">Block B Only</option>
                <option value="staff">Hostel Staff Only</option>
              </select>
            </div>
          </div>

          <div className="modal-form-group">
            <label>Detailed Announcement Text *</label>
            <textarea
              rows="4"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Full announcement description..."
            />
          </div>

          <div className="modal-form-actions">
            <button
              type="button"
              onClick={() => { setShowAddModal(false); setShowEditModal(false); }}
              className="btn-modal-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="btn-modal-confirm btn-primary"
            >
              {actionLoading ? 'Publishing...' : showAddModal ? 'Publish Announcement' : 'Save Notice'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        isDanger={true}
        title="Delete Notice?"
        message={`Are you sure you want to permanently remove the announcement "${activeNotice?.title}"?`}
        confirmText="Delete Notice"
        loading={actionLoading}
      />
    </div>
  );
}
