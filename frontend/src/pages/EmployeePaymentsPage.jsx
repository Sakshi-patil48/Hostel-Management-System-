import React, { useState, useEffect } from 'react';
import { hostelService } from '../services/hostelService';
import Modal from '../components/Modal';
import {
  DollarSign, Plus, Search, Calendar, CheckCircle2,
  AlertCircle, FileText, User
} from 'lucide-react';

export default function EmployeePaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    employee: '',
    voucher_number: `SAL-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    amount: '',
    salary_month: 'October 2026',
    payment_method: 'bank_transfer',
    remarks: 'Monthly salary credited via electronic fund transfer.',
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [payRes, empRes] = await Promise.all([
        hostelService.getEmployeePayments(),
        hostelService.getEmployees({ status: 'active' })
      ]);
      setPayments(payRes);
      setEmployees(empRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    const firstEmp = employees[0];
    setFormData({
      employee: firstEmp?.id || '',
      voucher_number: `SAL-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      amount: firstEmp?.monthly_salary || '25000.00',
      salary_month: 'October 2026',
      payment_method: 'bank_transfer',
      remarks: 'Monthly salary credited via electronic fund transfer.',
    });
    setFormError('');
    setShowModal(true);
  };

  const handleEmployeeChange = (e) => {
    const empId = e.target.value;
    const selected = employees.find(emp => emp.id === Number(empId));
    setFormData({
      ...formData,
      employee: empId,
      amount: selected ? selected.monthly_salary : formData.amount,
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.employee || !formData.amount) {
      setFormError('Please select employee and verify salary amount.');
      return;
    }
    setActionLoading(true);
    setFormError('');
    try {
      await hostelService.recordEmployeePayment(formData);
      setShowModal(false);
      fetchData();
    } catch (err) {
      setFormError(err.message || 'Error creating payment voucher.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Employee Salary Disbursement</h1>
          <p className="page-subtitle">Disburse monthly staff compensation, track electronic vouchers, and view payroll history</p>
        </div>
        <button onClick={handleOpenAdd} className="btn-primary-action">
          <Plus size={16} />
          <span>Disburse Salary Voucher</span>
        </button>
      </div>

      <div className="glass-table-container">
        <table className="glass-table">
          <thead>
            <tr>
              <th>Voucher No</th>
              <th>Employee Name</th>
              <th>Employee ID</th>
              <th>Salary Month</th>
              <th>Disbursed Amount</th>
              <th>Payment Date</th>
              <th>Payment Method</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center py-6">Loading salary vouchers...</td>
              </tr>
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-6">No salary vouchers recorded.</td>
              </tr>
            ) : (
              payments.map((p) => (
                <tr key={p.id}>
                  <td>
                    <span className="font-mono text-bold text-blue-600">{p.voucher_number}</span>
                  </td>
                  <td>
                    <strong>{p.employee_name}</strong>
                  </td>
                  <td>
                    <span className="font-mono text-xs">{p.employee_code}</span>
                  </td>
                  <td>{p.salary_month}</td>
                  <td className="text-green-600 font-bold">
                    ₹ {Number(p.amount).toLocaleString('en-IN')}
                  </td>
                  <td>{p.payment_date}</td>
                  <td>
                    <span className="capitalize">{p.payment_method?.replace('_', ' ')}</span>
                  </td>
                  <td>
                    <span className="text-xs text-muted">{p.remarks}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Disburse Salary Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Disburse Staff Salary Voucher"
      >
        <form onSubmit={handleSave} className="modal-form">
          {formError && (
            <div className="form-error-banner">
              <AlertCircle size={16} />
              <span>{formError}</span>
            </div>
          )}

          <div className="modal-form-group">
            <label>Select Employee *</label>
            <select
              value={formData.employee}
              onChange={handleEmployeeChange}
              required
            >
              <option value="">-- Choose Employee --</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.full_name} ({e.employee_id}) — {e.role} (Salary: ₹{Number(e.monthly_salary).toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div className="form-row-2">
            <div className="modal-form-group">
              <label>Voucher Number *</label>
              <input
                type="text"
                required
                value={formData.voucher_number}
                onChange={(e) => setFormData({ ...formData, voucher_number: e.target.value })}
              />
            </div>
            <div className="modal-form-group">
              <label>Disbursement Amount (₹) *</label>
              <input
                type="number"
                step="100"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="modal-form-group">
              <label>Salary Month</label>
              <input
                type="text"
                required
                value={formData.salary_month}
                onChange={(e) => setFormData({ ...formData, salary_month: e.target.value })}
                placeholder="e.g. October 2026"
              />
            </div>
            <div className="modal-form-group">
              <label>Payment Method</label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              >
                <option value="bank_transfer">Direct Bank Transfer (NEFT/RTGS)</option>
                <option value="cash">Cash Voucher</option>
                <option value="cheque">Account Payee Cheque</option>
              </select>
            </div>
          </div>

          <div className="modal-form-group">
            <label>Payment Remarks</label>
            <input
              type="text"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            />
          </div>

          <div className="modal-form-actions">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="btn-modal-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="btn-modal-confirm btn-primary"
            >
              {actionLoading ? 'Disbursing...' : 'Confirm Disbursement'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
