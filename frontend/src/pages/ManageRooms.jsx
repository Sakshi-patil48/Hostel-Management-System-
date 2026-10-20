import React from 'react';
import { useRooms } from '../hooks/useRooms';
import { formatCurrency, getRoomSectionLabel } from '../utils/formatters';
import Modal from '../components/common/Modal';
import ConfirmModal from '../components/common/ConfirmModal';
import SearchBar from '../components/common/SearchBar';
import StatusBadge from '../components/common/StatusBadge';
import FeedbackBanner from '../components/common/FeedbackBanner';
import {
  Plus, Edit2, Trash2, Eye, Bed as BedIcon, AlertCircle
} from 'lucide-react';

export default function ManageRooms() {
  const {
    rooms,
    blocks,
    loading,
    search,
    setSearch,
    selectedBlock,
    setSelectedBlock,
    selectedSection,
    setSelectedSection,
    selectedType,
    setSelectedType,
    successMsg,
    setSuccessMsg,
    errorMsg,
    setErrorMsg,
    showAddModal,
    showEditModal,
    showViewModal,
    showDeleteModal,
    activeRoom,
    formData,
    formError,
    actionLoading,
    openAddModal,
    openEditModal,
    openViewModal,
    openDeleteModal,
    closeModals,
    updateFormField,
    saveRoom,
    deleteRoom,
  } = useRooms();

  return (
    <div className="page-wrapper">
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Manage Rooms & Bed Capacity</h1>
          <p className="page-subtitle">Configure hostel rooms, bed assignments, and occupancy limits</p>
        </div>
        <button onClick={openAddModal} className="btn-primary-action">
          <Plus size={16} />
          <span>Add New Room</span>
        </button>
      </div>

      {/* Real-time Save & Action Feedback Notification */}
      {successMsg && (
        <FeedbackBanner
          type="success"
          message={successMsg}
          onClose={() => setSuccessMsg('')}
          className="mb-4"
        />
      )}

      {errorMsg && (
        <FeedbackBanner
          type="error"
          message={errorMsg}
          onClose={() => setErrorMsg('')}
          className="mb-4"
        />
      )}

      {/* Filter and Search Bar */}
      <div className="table-controls-bar">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search room number, floor, or section (Room A, B, C)..."
        />

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
                  <td>{formatCurrency(room.monthly_rent)}</td>
                  <td>
                    <StatusBadge
                      status={room.is_full ? 'full' : 'available'}
                      label={room.is_full ? 'Full' : 'Available'}
                    />
                  </td>
                  <td className="text-right">
                    <div className="row-action-btns">
                      <button
                        onClick={() => openViewModal(room)}
                        className="btn-row-action view"
                        title="View Beds & Details"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => openEditModal(room)}
                        className="btn-row-action edit"
                        title="Edit Room"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => openDeleteModal(room)}
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
        onClose={closeModals}
        title={showAddModal ? "Add New Hostel Room" : `Edit Room ${activeRoom?.room_number}`}
      >
        <form onSubmit={saveRoom} className="modal-form">
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
                onChange={(e) => updateFormField('room_number', e.target.value)}
                placeholder="e.g. 105 or B-204"
              />
            </div>
            <div className="modal-form-group">
              <label>Hostel Floor</label>
              <select
                value={formData.block}
                onChange={(e) => updateFormField('block', e.target.value)}
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
                onChange={(e) => updateFormField('floor', Number(e.target.value))}
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
                  updateFormField('room_type', type);
                  updateFormField('capacity', caps[type] || 2);
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
                onChange={(e) => updateFormField('capacity', Number(e.target.value))}
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
                onChange={(e) => updateFormField('monthly_rent', e.target.value)}
              />
            </div>
            <div className="modal-form-group">
              <label>Operational Status</label>
              <select
                value={formData.status}
                onChange={(e) => updateFormField('status', e.target.value)}
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
              onChange={(e) => updateFormField('amenities', e.target.value)}
              placeholder="e.g. Attached Bathroom, Balcony, Wi-Fi"
            />
          </div>

          <div className="modal-form-actions">
            <button
              type="button"
              onClick={closeModals}
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
        onClose={closeModals}
        title={`Room Details — ${activeRoom?.room_number}`}
      >
        {activeRoom && (
          <div className="room-detail-modal-body">
            <div className="room-info-summary">
              <div><strong>Hostel Floor:</strong> {activeRoom.block_name}</div>
              <div><strong>Room Section:</strong> {activeRoom.section_name || getRoomSectionLabel(activeRoom.floor)}</div>
              <div><strong>Type:</strong> {activeRoom.room_type}</div>
              <div><strong>Rent:</strong> {formatCurrency(activeRoom.monthly_rent)} / month</div>
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
        onClose={closeModals}
        onConfirm={deleteRoom}
        isDanger={true}
        title={`Delete Room ${activeRoom?.room_number}?`}
        message={`Are you sure you want to permanently delete Room ${activeRoom?.room_number}? Note: Deletion is only permitted if there are zero active student allocations.`}
        confirmText="Delete Room"
        loading={actionLoading}
      />
    </div>
  );
}
