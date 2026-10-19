import React, { useState, useEffect } from 'react';
import { hostelService } from '../services/hostelService';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import {
  KeyRound, Bed, User, Building2, CheckCircle2,
  AlertCircle, ArrowRightLeft, LogOut, Search, Filter
} from 'lucide-react';

export default function RoomAllocationPage() {
  const [allocations, setAllocations] = useState([]);
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [availableBeds, setAvailableBeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('active');

  // Modals
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [activeAlloc, setActiveAlloc] = useState(null);

  // Form
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [selectedBed, setSelectedBed] = useState('');
  const [remarks, setRemarks] = useState('Standard semester bed allocation.');
  const [actionLoading, setActionLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [allocsRes, studentsRes, roomsRes] = await Promise.all([
        hostelService.getAllocations({ status: statusFilter }),
        hostelService.getStudents({ status: 'active' }),
        hostelService.getRooms({ status: 'active' })
      ]);
      setAllocations(allocsRes);
      setStudents(studentsRes);
      setRooms(roomsRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  // Load available beds when a room is selected
  useEffect(() => {
    if (selectedRoom) {
      hostelService.getBeds({ room: selectedRoom, available: 'true' })
        .then((beds) => {
          setAvailableBeds(beds);
          if (beds.length > 0) setSelectedBed(beds[0].id);
          else setSelectedBed('');
        })
        .catch(console.error);
    } else {
      setAvailableBeds([]);
      setSelectedBed('');
    }
  }, [selectedRoom]);

  const handleOpenAllocate = () => {
    // Pick unallocated students first
    const unallocated = students.filter(s => !s.current_room);
    if (unallocated.length > 0) setSelectedStudent(unallocated[0].id);
    else if (students.length > 0) setSelectedStudent(students[0].id);

    if (rooms.length > 0) setSelectedRoom(rooms[0].id);
    setRemarks('Standard academic session bed allotment.');
    setFormError('');
    setShowAllocateModal(true);
  };

  const handleSaveAllocation = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !selectedRoom || !selectedBed) {
      setFormError('Please select student, room, and an available bed.');
      return;
    }

    setActionLoading(true);
    setFormError('');
    try {
      await hostelService.createAllocation({
        student: selectedStudent,
        room: selectedRoom,
        bed: selectedBed,
        remarks,
        status: 'active',
      });
      setShowAllocateModal(false);
      fetchData();
    } catch (err) {
      setFormError(err.message || 'Failed to allocate bed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckoutConfirm = async () => {
    if (!activeAlloc) return;
    setActionLoading(true);
    try {
      await hostelService.checkoutAllocation(activeAlloc.id);
      setShowCheckoutModal(false);
      fetchData();
    } catch (err) {
      alert(err.message || 'Error checking out student.');
      setShowCheckoutModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Room & Bed Allocation</h1>
          <p className="page-subtitle">Assign students to available beds, manage room transfers and checkouts</p>
        </div>
        <button onClick={handleOpenAllocate} className="btn-primary-action">
          <KeyRound size={16} />
          <span>Allocate Bed to Student</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="table-controls-bar">
        <div className="segment-filter-tabs">
          <button
            className={`filter-tab ${statusFilter === 'active' ? 'active' : ''}`}
            onClick={() => setStatusFilter('active')}
          >
            Active Allocations
          </button>
          <button
            className={`filter-tab ${statusFilter === 'checked_out' ? 'active' : ''}`}
            onClick={() => setStatusFilter('checked_out')}
          >
            Checkout History
          </button>
          <button
            className={`filter-tab ${statusFilter === '' ? 'active' : ''}`}
            onClick={() => setStatusFilter('')}
          >
            All Records
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="glass-table-container">
        <table className="glass-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Student ID</th>
              <th>Room Assigned</th>
              <th>Bed</th>
              <th>Allocated Date</th>
              <th>Checkout Date</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center py-6">Loading bed allocations...</td>
              </tr>
            ) : allocations.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-6">No allocations found for this filter.</td>
              </tr>
            ) : (
              allocations.map((alloc) => (
                <tr key={alloc.id}>
                  <td>
                    <strong>{alloc.student_name}</strong>
                  </td>
                  <td>
                    <span className="font-mono text-xs">{alloc.student_code}</span>
                  </td>
                  <td>
                    <span className="room-code-badge">Room {alloc.room_number}</span>
                  </td>
                  <td>
                    <span className="bed-code-badge">{alloc.bed_name}</span>
                  </td>
                  <td>{alloc.allocated_date}</td>
                  <td>{alloc.checkout_date || '—'}</td>
                  <td>
                    <span className={`status-pill-badge ${alloc.status}`}>
                      {alloc.status === 'active' ? 'Active Living' : 'Checked Out'}
                    </span>
                  </td>
                  <td className="text-right">
                    {alloc.status === 'active' ? (
                      <button
                        onClick={() => { setActiveAlloc(alloc); setShowCheckoutModal(true); }}
                        className="btn-sm-action danger"
                        title="Release Bed / Checkout Student"
                      >
                        <LogOut size={13} />
                        <span>Checkout / Release</span>
                      </button>
                    ) : (
                      <span className="text-xs text-muted">Completed</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Allocate Bed Modal */}
      <Modal
        isOpen={showAllocateModal}
        onClose={() => setShowAllocateModal(false)}
        title="Assign Bed to Student"
      >
        <form onSubmit={handleSaveAllocation} className="modal-form">
          {formError && (
            <div className="form-error-banner">
              <AlertCircle size={16} />
              <span>{formError}</span>
            </div>
          )}

          <div className="modal-form-group">
            <label>Select Student *</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              required
            >
              <option value="">-- Choose Student --</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name} ({s.student_id}) {s.current_room ? `[Already in ${s.current_room}]` : '[Unallocated]'}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row-2">
            <div className="modal-form-group">
              <label>Select Room *</label>
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                required
              >
                <option value="">-- Choose Room --</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    Room {r.room_number} - {r.block_name} ({r.available_beds_count} beds free)
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-form-group">
              <label>Available Bed *</label>
              <select
                value={selectedBed}
                onChange={(e) => setSelectedBed(e.target.value)}
                required
                disabled={availableBeds.length === 0}
              >
                {availableBeds.length === 0 ? (
                  <option value="">No beds available in this room</option>
                ) : (
                  availableBeds.map((b) => (
                    <option key={b.id} value={b.id}>{b.bed_number} (Free)</option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div className="modal-form-group">
            <label>Allocation Remarks / Notes</label>
            <textarea
              rows="2"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Special medical request, ground floor preference..."
            />
          </div>

          <div className="modal-form-actions">
            <button
              type="button"
              onClick={() => setShowAllocateModal(false)}
              className="btn-modal-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading || availableBeds.length === 0}
              className="btn-modal-confirm btn-primary"
            >
              {actionLoading ? 'Allocating...' : 'Confirm Bed Allocation'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Checkout Bed Confirmation */}
      <ConfirmModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        onConfirm={handleCheckoutConfirm}
        isDanger={true}
        title="Release Bed Allocation"
        message={`Confirm checkout for ${activeAlloc?.student_name} from Room ${activeAlloc?.room_number} (${activeAlloc?.bed_name})? The bed will be immediately marked as vacant and available for re-allocation.`}
        confirmText="Confirm Checkout"
        loading={actionLoading}
      />
    </div>
  );
}
