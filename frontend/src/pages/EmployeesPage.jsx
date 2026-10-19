import React, { useState, useEffect } from 'react';
import { hostelService } from '../services/hostelService';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import {
  Briefcase, Plus, Search, Filter, Edit2, Trash2,
  Phone, Mail, DollarSign, Calendar, CheckCircle2, AlertCircle
} from 'lucide-react';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeEmp, setActiveEmp] = useState(null);

  const [formData, setFormData] = useState({
    employee_id: `EMP-${Math.floor(100 + Math.random() * 900)}`,
    full_name: '',
    role: 'caretaker',
    phone: '',
    email: '',
    joining_date: new Date().toISOString().split('T')[0],
    monthly_salary: '25000.00',
    status: 'active',
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await hostelService.getEmployees({ search, role: roleFilter });
      setEmployees(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [search, roleFilter]);

  const handleOpenAdd = () => {
    setFormData({
      employee_id: `EMP-${Math.floor(100 + Math.random() * 900)}`,
      full_name: '',
      role: 'caretaker',
      phone: '',
      email: '',
      joining_date: new Date().toISOString().split('T')[0],
      monthly_salary: '25000.00',
      status: 'active',
    });
    setFormError('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (emp) => {
    setActiveEmp(emp);
    setFormData({
      employee_id: emp.employee_id,
      full_name: emp.full_name,
      role: emp.role,
      phone: emp.phone,
      email: emp.email || '',
      joining_date: emp.joining_date,
      monthly_salary: emp.monthly_salary,
      status: emp.status,
    });
    setFormError('');
    setShowEditModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.full_name.trim() || !formData.phone.trim()) {
      setFormError('Staff name and contact phone number are required.');
      return;
    }

    setActionLoading(true);
    setFormError('');
    try {
      if (showAddModal) {
        await hostelService.createEmployee(formData);
      } else {
        await hostelService.updateEmployee(activeEmp.id, formData);
      }
      setShowAddModal(false);
      setShowEditModal(false);
      fetchEmployees();
    } catch (err) {
      setFormError(err.message || 'Error saving employee profile.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!activeEmp) return;
    setActionLoading(true);
    try {
      await hostelService.deleteEmployee(activeEmp.id);
      setShowDeleteModal(false);
      fetchEmployees();
    } catch (err) {
      alert(err.message || 'Error deleting employee.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Employees & Hostel Staff</h1>
          <p className="page-subtitle">Manage wardens, security supervisors, caretakers, electricians, and mess staff</p>
        </div>
        <button onClick={handleOpenAdd} className="btn-primary-action">
          <Plus size={16} />
          <span>Add New Employee</span>
        </button>
      </div>

      <div className="table-controls-bar">
        <div className="search-input-wrap">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search staff by name or employee ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filters-group">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Roles</option>
            <option value="warden">Chief Warden</option>
            <option value="assistant_warden">Assistant Warden</option>
            <option value="accountant">Accountant / Cashier</option>
            <option value="caretaker">Hostel Caretaker</option>
            <option value="security">Security Supervisor</option>
            <option value="electrician">Electrician</option>
            <option value="plumber">Plumber</option>
            <option value="mess_head">Mess Head Cook</option>
          </select>
        </div>
      </div>

      <div className="glass-table-container">
        <table className="glass-table">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Full Name</th>
              <th>Designation / Role</th>
              <th>Phone</th>
              <th>Joining Date</th>
              <th>Monthly Salary</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center py-6">Loading staff records...</td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-6">No employee records found.</td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr key={emp.id}>
                  <td>
                    <span className="font-mono text-bold">{emp.employee_id}</span>
                  </td>
                  <td>
                    <strong>{emp.full_name}</strong>
                    {emp.email && <div className="text-xs text-muted">{emp.email}</div>}
                  </td>
                  <td>
                    <span className="category-pill">{emp.role?.replace('_', ' ')}</span>
                  </td>
                  <td>{emp.phone}</td>
                  <td>{emp.joining_date}</td>
                  <td>₹ {Number(emp.monthly_salary).toLocaleString('en-IN')}</td>
                  <td>
                    <span className={`status-pill-badge ${emp.status}`}>
                      {emp.status === 'active' ? 'Active Duty' : emp.status}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="row-action-btns">
                      <button
                        onClick={() => handleOpenEdit(emp)}
                        className="btn-row-action edit"
                        title="Edit Profile"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => { setActiveEmp(emp); setShowDeleteModal(true); }}
                        className="btn-row-action delete"
                        title="Delete Profile"
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

      {/* Add / Edit Employee Modal */}
      <Modal
        isOpen={showAddModal || showEditModal}
        onClose={() => { setShowAddModal(false); setShowEditModal(false); }}
        title={showAddModal ? "Register New Employee" : `Edit Profile — ${activeEmp?.full_name}`}
      >
        <form onSubmit={handleSave} className="modal-form">
          {formError && (
            <div className="form-error-banner">
              <AlertCircle size={16} />
              <span>{formError}</span>
            </div>
          )}

          <div className="form-row-2">
            <div className="modal-form-group">
              <label>Employee ID *</label>
              <input
                type="text"
                required
                value={formData.employee_id}
                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
              />
            </div>
            <div className="modal-form-group">
              <label>Full Name *</label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Staff Full Name"
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="modal-form-group">
              <label>Role / Position</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="warden">Chief Warden</option>
                <option value="assistant_warden">Assistant Warden</option>
                <option value="accountant">Accountant / Cashier</option>
                <option value="caretaker">Hostel Caretaker</option>
                <option value="security">Security Supervisor</option>
                <option value="electrician">Chief Electrician</option>
                <option value="plumber">Plumbing Technician</option>
                <option value="mess_head">Mess Head Cook</option>
              </select>
            </div>

            <div className="modal-form-group">
              <label>Contact Phone *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="modal-form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="optional"
              />
            </div>
            <div className="modal-form-group">
              <label>Monthly Salary (₹)</label>
              <input
                type="number"
                step="500"
                value={formData.monthly_salary}
                onChange={(e) => setFormData({ ...formData, monthly_salary: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="modal-form-group">
              <label>Joining Date</label>
              <input
                type="date"
                value={formData.joining_date}
                onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
              />
            </div>
            <div className="modal-form-group">
              <label>Duty Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="active">Active Duty</option>
                <option value="on_leave">On Approved Leave</option>
                <option value="resigned">Relieved / Resigned</option>
              </select>
            </div>
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
              {actionLoading ? 'Saving...' : showAddModal ? 'Register Employee' : 'Save Changes'}
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
        title="Delete Employee Profile?"
        message={`Confirm removing ${activeEmp?.full_name} (${activeEmp?.employee_id}) from active staff registry?`}
        confirmText="Delete Profile"
        loading={actionLoading}
      />
    </div>
  );
}
