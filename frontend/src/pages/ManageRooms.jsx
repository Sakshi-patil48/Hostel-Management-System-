import React, { useState, useEffect } from 'react';
import { hostelService } from '../services/hostelService';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import {
  Building2, Plus, Search, Filter, Edit2, Trash2,
  CheckCircle, AlertCircle, Eye, Bed as BedIcon
} from 'lucide-react';

const getRoomSectionLabel = (val) => {
  const map = { 1: 'Room A', 2: 'Room B', 3: 'Room C', 4: 'Room D', 5: 'Room E' };
  return map[Number(val)] || `Room ${String.fromCharCode(64 + (Number(val) || 1))}`;
};

export default function ManageRooms() {
  const [rooms, setRooms] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeRoom, setActiveRoom] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    room_number: '',
    block: '',
    floor: 1,
    room_type: 'double',
    capacity: 2,
    monthly_rent: '4500.00',
    status: 'active',
    amenities: 'Attached Bath, Wi-Fi, Balcony'
  });
  const [formError, setFormError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRoomsAndBlocks = async () => {
    try {
      setLoading(true);
      const [roomsRes, blocksRes] = await Promise.all([
        hostelService.getRooms({
          search,
          block: selectedBlock,
          room_type: selectedType,
          floor: selectedSection || undefined,
        }),
        hostelService.getBlocks()
      ]);
      setRooms(roomsRes);
      setBlocks(blocksRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomsAndBlocks();
  }, [search, selectedBlock, selectedSection, selectedType]);

  const handleOpenAdd = () => {
    setFormData({
      room_number: '',
      block: blocks[0]?.id || '',
      floor: 1,
      room_type: 'double',
      capacity: 2,
      monthly_rent: '4500.00',
      status: 'active',
      amenities: 'Attached Bath, Wi-Fi, Balcony'
    });
    setFormError('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (room) => {
    setActiveRoom(room);
    setFormData({
      room_number: room.room_number,
      block: room.block,
      floor: room.floor,
      room_type: room.room_type,
      capacity: room.capacity,
      monthly_rent: room.monthly_rent,
      status: room.status,
      amenities: room.amenities || ''
    });
    setFormError('');
    setShowEditModal(true);
  };

  const handleSaveRoom = async (e) => {
    e.preventDefault();
    if (!formData.room_number.trim()) {
      setFormError('Room number is required.');
      return;
    }
    setActionLoading(true);
    setFormError('');
    try {
      const payload = {
        room_number: formData.room_number.trim(),
        block: Number(formData.block) || blocks[0]?.id || 1,
        floor: Number(formData.floor) || 1,
        room_type: formData.room_type,
        capacity: Number(formData.capacity) || 2,
        monthly_rent: Number(formData.monthly_rent).toFixed(2),
        status: formData.status,
        amenities: formData.amenities.trim()
      };
      if (showAddModal) {
        await hostelService.createRoom(payload);
        setSuccessMsg(`Room ${payload.room_number} created and saved successfully!`);
      } else {
        await hostelService.updateRoom(activeRoom.id, payload);
        setSuccessMsg(`Room ${payload.room_number} updated and saved successfully!`);
      }
      setShowAddModal(false);
      setShowEditModal(false);
      await fetchRoomsAndBlocks();
      setTimeout(() => setSuccessMsg(''), 4500);
    } catch (err) {
      setFormError(err.message || 'Error saving room details.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteRoom = async () => {
    if (!activeRoom) return;
    setActionLoading(true);
    try {
      await hostelService.deleteRoom(activeRoom.id);
      setSuccessMsg(`Room ${activeRoom.room_number} was successfully deleted.`);
      setShowDeleteModal(false);
      setActiveRoom(null);
      await fetchRoomsAndBlocks();
      setTimeout(() => setSuccessMsg(''), 4500);
    } catch (err) {
      alert(err.message || 'Cannot delete room.');
      setShowDeleteModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Manage Rooms & Bed Capacity</h1>
          <p className="page-subtitle">Configure hostel rooms, bed assignments, and occupancy limits</p>
        </div>
        <button onClick={handleOpenAdd} className="btn-primary-action">
          <Plus size={16} />
          <span>Add New Room</span>
        </button>
      </div>

      {/* Real-time Save & Action Feedback Notification */}
      {successMsg && (
        <div className="table-success-toast animate-fadeIn" role="status">
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="table-controls-bar">
        <div className="search-input-wrap">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search room number, floor, or section (Room A, B, C)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filters-group">
          <select
            value={selectedBlock}
            onChange={(e) => setSelectedBlock(e.target.value)}
            className="filter-select"
          >
            <option value="">All Floors</option>
            {blocks.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="filter-select"
          >
            <option value="">All Room Sections</option>
            <option value="1">Room A</option>
            <option value="2">Room B</option>
            <option value="3">Room C</option>
            <option value="4">Room D</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="filter-select"
          >
            <option value="">All Room Types</option>
            <option value="single">Single Bed</option>
            <option value="double">Double Sharing</option>
            <option value="triple">Triple Sharing</option>
            <option value="dorm">Dormitory</option>
          </select>
        </div>
      </div>

      {/* Rooms Table */}
      <div className="glass-table-container">
        <table className="glass-table">
          <thead>
            <tr>
              <th>Room No</th>
              <th>Hostel Floor</th>
              <th>Room Section</th>
              <th>Type</th>
              <th>Capacity</th>
              <th>Occupied / Vacant</th>
              <th>Rent / Mo</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="text-center py-6">Loading rooms...</td>
              </tr>
            ) : rooms.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-6">No rooms found matching your filters.</td>
              </tr>
            ) : (
              rooms.map((room) => (
                <tr key={room.id}>
                  <td>
                    <span className="room-code-badge">{room.room_number}</span>
                  </td>
                  <td>{room.block_name}</td>
                  <td>
                    <span className="room-section-badge">
                      {room.section_name || getRoomSectionLabel(room.floor)}
                    </span>
                  </td>
                  <td className="capitalize">{room.room_type}</td>
                  <td>{room.capacity} Beds</td>
                  <td>
                    <div className="bed-status-indicator">
                      <span className="occ-count">{room.occupied_beds_count} Occupied</span>
                      <span className="vac-count">({room.available_beds_count} Free)</span>
                    </div>
                  </td>
                  <td>₹ {Number(room.monthly_rent).toLocaleString('en-IN')}</td>
                  <td>
                    <span className={`status-pill-badge ${room.is_full ? 'full' : 'available'}`}>
                      {room.is_full ? 'Full' : 'Available'}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="row-action-btns">
                      <button
                        onClick={() => { setActiveRoom(room); setShowViewModal(true); }}
                        className="btn-row-action view"
                        title="View Beds & Details"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(room)}
                        className="btn-row-action edit"
                        title="Edit Room"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => { setActiveRoom(room); setShowDeleteModal(true); }}
                        className="btn-row-action delete"
                        title="Delete Room"
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

      {/* Add / Edit Room Modal */}
      <Modal
        isOpen={showAddModal || showEditModal}
        onClose={() => { setShowAddModal(false); setShowEditModal(false); }}
        title={showAddModal ? "Add New Hostel Room" : `Edit Room ${activeRoom?.room_number}`}
      >
        <form onSubmit={handleSaveRoom} className="modal-form">
          {formError && (
            <div className="form-error-banner">
              <AlertCircle size={16} />
              <span>{formError}</span>
            </div>
          )}

          <div className="form-row-2">
            <div className="modal-form-group">
              <label>Room Number</label>
              <input
                type="text"
                required
                value={formData.room_number}
                onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                placeholder="e.g. 105 or B-204"
              />
            </div>
            <div className="modal-form-group">
              <label>Hostel Floor</label>
              <select
                value={formData.block}
                onChange={(e) => setFormData({ ...formData, block: e.target.value })}
              >
                {blocks.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row-3">
            <div className="modal-form-group">
              <label>Room Section</label>
              <select
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: Number(e.target.value) })}
              >
                <option value={1}>Room A</option>
                <option value={2}>Room B</option>
                <option value={3}>Room C</option>
                <option value={4}>Room D</option>
              </select>
            </div>
            <div className="modal-form-group">
              <label>Room Type</label>
              <select
                value={formData.room_type}
                onChange={(e) => {
                  const type = e.target.value;
                  const caps = { single: 1, double: 2, triple: 3, dorm: 4 };
                  setFormData({ ...formData, room_type: type, capacity: caps[type] || 2 });
                }}
              >
                <option value="single">Single Bed</option>
                <option value="double">Double Sharing</option>
                <option value="triple">Triple Sharing</option>
                <option value="dorm">Dormitory (4 Beds)</option>
              </select>
            </div>
            <div className="modal-form-group">
              <label>Capacity (Beds)</label>
              <input
                type="number"
                min="1"
                max="8"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="modal-form-group">
              <label>Monthly Rent (₹)</label>
              <input
                type="number"
                step="50"
                value={formData.monthly_rent}
                onChange={(e) => setFormData({ ...formData, monthly_rent: e.target.value })}
              />
            </div>
            <div className="modal-form-group">
              <label>Operational Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="active">Active / Operational</option>
                <option value="maintenance">Under Maintenance</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="modal-form-group">
            <label>Amenities</label>
            <input
              type="text"
              value={formData.amenities}
              onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
              placeholder="e.g. Attached Bathroom, Balcony, Wi-Fi"
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
              {actionLoading ? 'Saving...' : showAddModal ? 'Create Room' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Room & Beds Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title={`Room Details — ${activeRoom?.room_number}`}
      >
        {activeRoom && (
          <div className="room-detail-modal-body">
            <div className="room-info-summary">
              <div><strong>Hostel Floor:</strong> {activeRoom.block_name}</div>
              <div><strong>Room Section:</strong> {activeRoom.section_name || getRoomSectionLabel(activeRoom.floor)}</div>
              <div><strong>Type:</strong> {activeRoom.room_type}</div>
              <div><strong>Rent:</strong> ₹ {Number(activeRoom.monthly_rent).toLocaleString('en-IN')} / month</div>
              <div><strong>Amenities:</strong> {activeRoom.amenities || 'Standard'}</div>
            </div>

            <h3 className="section-subtitle mt-4 mb-2">Bed Allocation Status</h3>
            <div className="beds-visual-grid">
              {activeRoom.beds?.map((b) => (
                <div key={b.id} className={`bed-status-card ${b.is_occupied ? 'occupied' : 'vacant'}`}>
                  <BedIcon size={20} />
                  <span className="bed-label">{b.bed_number}</span>
                  <span className="bed-tag">{b.is_occupied ? 'Occupied' : 'Vacant'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Safe Delete Room Confirm Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteRoom}
        isDanger={true}
        title={`Delete Room ${activeRoom?.room_number}?`}
        message={`Are you sure you want to permanently delete Room ${activeRoom?.room_number}? Note: Deletion is only permitted if there are zero active student allocations.`}
        confirmText="Delete Room"
        loading={actionLoading}
      />
    </div>
  );
}
