import { useState, useEffect, useCallback } from 'react';
import { roomsApi } from '../services/api/rooms.api';

const DEFAULT_FORM = {
  room_number: '',
  block: '',
  floor: 1,
  room_type: 'double',
  capacity: 2,
  monthly_rent: '4500.00',
  status: 'active',
  amenities: 'Attached Bath, Wi-Fi, Balcony',
};

/**
 * Custom hook to manage Hostel Rooms business logic, filters, and CRUD
 */
export function useRooms() {
  const [rooms, setRooms] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeRoom, setActiveRoom] = useState(null);

  // Form State
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [formError, setFormError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRoomsAndBlocks = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const [roomsRes, blocksRes] = await Promise.all([
        roomsApi.getRooms({
          search,
          block: selectedBlock,
          room_type: selectedType,
          floor: selectedSection || undefined,
        }),
        roomsApi.getBlocks(),
      ]);
      setRooms(roomsRes || []);
      setBlocks(blocksRes || []);
    } catch (err) {
      setErrorMsg(err.message || 'Unable to load rooms. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  }, [search, selectedBlock, selectedSection, selectedType]);

  useEffect(() => {
    fetchRoomsAndBlocks();
  }, [fetchRoomsAndBlocks]);

  const openAddModal = useCallback(() => {
    setFormData({
      ...DEFAULT_FORM,
      block: blocks[0]?.id || '',
    });
    setFormError('');
    setShowAddModal(true);
  }, [blocks]);

  const openEditModal = useCallback((room) => {
    setActiveRoom(room);
    setFormData({
      room_number: room.room_number,
      block: room.block,
      floor: room.floor,
      room_type: room.room_type,
      capacity: room.capacity,
      monthly_rent: room.monthly_rent,
      status: room.status,
      amenities: room.amenities || '',
    });
    setFormError('');
    setShowEditModal(true);
  }, []);

  const openViewModal = useCallback((room) => {
    setActiveRoom(room);
    setShowViewModal(true);
  }, []);

  const openDeleteModal = useCallback((room) => {
    setActiveRoom(room);
    setShowDeleteModal(true);
  }, []);

  const closeModals = useCallback(() => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowViewModal(false);
    setShowDeleteModal(false);
    setActiveRoom(null);
    setFormError('');
  }, []);

  const updateFormField = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const saveRoom = useCallback(async (e) => {
    if (e) e.preventDefault();
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
        amenities: formData.amenities.trim(),
      };
      if (showAddModal) {
        await roomsApi.createRoom(payload);
        setSuccessMsg(`Room ${payload.room_number} created and saved successfully!`);
      } else {
        await roomsApi.updateRoom(activeRoom.id, payload);
        setSuccessMsg(`Room ${payload.room_number} updated and saved successfully!`);
      }
      closeModals();
      await fetchRoomsAndBlocks();
      setTimeout(() => setSuccessMsg(''), 4500);
    } catch (err) {
      setFormError(err.message || 'Error saving room details.');
    } finally {
      setActionLoading(false);
    }
  }, [formData, blocks, showAddModal, activeRoom, closeModals, fetchRoomsAndBlocks]);

  const deleteRoom = useCallback(async () => {
    if (!activeRoom) return;
    setActionLoading(true);
    try {
      await roomsApi.deleteRoom(activeRoom.id);
      setSuccessMsg(`Room ${activeRoom.room_number} was successfully deleted.`);
      closeModals();
      await fetchRoomsAndBlocks();
      setTimeout(() => setSuccessMsg(''), 4500);
    } catch (err) {
      setErrorMsg(err.message || 'Cannot delete room.');
      closeModals();
    } finally {
      setActionLoading(false);
    }
  }, [activeRoom, closeModals, fetchRoomsAndBlocks]);

  return {
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
    refreshRooms: fetchRoomsAndBlocks,
  };
}

export default useRooms;
