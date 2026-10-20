import { useState, useEffect, useCallback } from 'react';
import { studentsApi } from '../services/api/students.api';

/**
 * Custom hook to manage Student Directory business logic, filters, and CRUD
 */
export function useStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Modals state
  const [activeStudent, setActiveStudent] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Edit Form
  const [editFormData, setEditFormData] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await studentsApi.getStudents({
        search,
        status: statusFilter,
        course: courseFilter,
      });
      setStudents(res || []);
    } catch (err) {
      setErrorMsg(err.message || 'Unable to load students list.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, courseFilter]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const openEditModal = useCallback((student) => {
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
  }, []);

  const openViewModal = useCallback((student) => {
    setActiveStudent(student);
    setShowViewModal(true);
  }, []);

  const openDeleteModal = useCallback((student) => {
    setActiveStudent(student);
    setShowDeleteModal(true);
  }, []);

  const closeModals = useCallback(() => {
    setShowViewModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setActiveStudent(null);
    setFormError('');
  }, []);

  const updateEditFormField = useCallback((field, value) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const saveEdit = useCallback(async (e) => {
    if (e) e.preventDefault();
    setActionLoading(true);
    setFormError('');
    try {
      await studentsApi.updateStudent(activeStudent.id, editFormData);
      setSuccessMsg(`Student record for ${editFormData.full_name || activeStudent.full_name} updated successfully!`);
      closeModals();
      await fetchStudents();
      setTimeout(() => setSuccessMsg(''), 4500);
    } catch (err) {
      setFormError(err.message || 'Error updating student record.');
    } finally {
      setActionLoading(false);
    }
  }, [activeStudent, editFormData, closeModals, fetchStudents]);

  const deleteStudent = useCallback(async () => {
    if (!activeStudent) return;
    setActionLoading(true);
    try {
      await studentsApi.deleteStudent(activeStudent.id);
      setSuccessMsg(`Student ${activeStudent.full_name} was successfully removed.`);
      closeModals();
      await fetchStudents();
      setTimeout(() => setSuccessMsg(''), 4500);
    } catch (err) {
      setErrorMsg(err.message || 'Cannot delete student.');
      closeModals();
    } finally {
      setActionLoading(false);
    }
  }, [activeStudent, closeModals, fetchStudents]);

  return {
    students,
    loading,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    courseFilter,
    setCourseFilter,
    successMsg,
    setSuccessMsg,
    errorMsg,
    setErrorMsg,
    activeStudent,
    showViewModal,
    showEditModal,
    showDeleteModal,
    editFormData,
    actionLoading,
    formError,
    openEditModal,
    openViewModal,
    openDeleteModal,
    closeModals,
    updateEditFormField,
    saveEdit,
    deleteStudent,
    refreshStudents: fetchStudents,
  };
}

export default useStudents;
