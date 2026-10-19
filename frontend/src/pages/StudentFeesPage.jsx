import React, { useState, useEffect } from 'react';
import { hostelService } from '../services/hostelService';
import Modal from '../components/Modal';
import PrintableReceiptModal from '../components/PrintableReceiptModal';
import {
  CreditCard, Plus, Search, Filter, DollarSign,
  Printer, CheckCircle2, AlertCircle, Clock
} from 'lucide-react';

export default function StudentFeesPage() {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [showCreateFeeModal, setShowCreateFeeModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [activeFee, setActiveFee] = useState(null);
  const [lastPayment, setLastPayment] = useState(null);

  // Create Fee Form
  const [feeForm, setFeeForm] = useState({
    student: '',
    title: 'Fall Semester 2026 Hostel & Mess Fee',
    academic_term: 'Fall Term 2026',
    total_amount: '48000.00',
    due_date: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
  });

  // Record Payment Form
  const [payForm, setPayForm] = useState({
    amount_paid: '',
    payment_method: 'bank_transfer',
    transaction_reference: '',
    remarks: 'Authorized front-desk verified payment.',
    recorded_by: 'Hostel Accounts Desk',
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchFeesAndStudents = async () => {
    try {
      setLoading(true);
      const [feesRes, studentsRes] = await Promise.all([
        hostelService.getFees({ search, status: statusFilter }),
        hostelService.getStudents({ status: 'active' }),
      ]);
      setFees(feesRes);
      setStudents(studentsRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeesAndStudents();
  }, [search, statusFilter]);

  const handleOpenCreateFee = () => {
    setFeeForm({
      student: students[0]?.id || '',
      title: 'Fall Semester 2026 Hostel & Mess Fee',
      academic_term: 'Fall Term 2026',
      total_amount: '48000.00',
      due_date: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    });
    setFormError('');
    setShowCreateFeeModal(true);
  };

  const handleSaveFee = async (e) => {
    e.preventDefault();
    if (!feeForm.student) {
      setFormError('Please select a student.');
      return;
    }
    setActionLoading(true);
    setFormError('');
    try {
      await hostelService.createFee(feeForm);
      setShowCreateFeeModal(false);
      fetchFeesAndStudents();
    } catch (err) {
      setFormError(err.message || 'Error generating fee record.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenPayment = (fee) => {
    setActiveFee(fee);
    setPayForm({
      amount_paid: fee.balance_amount.toString(),
      payment_method: 'bank_transfer',
      transaction_reference: `TXN-OFFLINE-${Math.floor(100000 + Math.random() * 900000)}`,
      remarks: 'Authorized front-desk verified payment.',
      recorded_by: 'Hostel Accounts Desk',
    });
    setFormError('');
    setShowPaymentModal(true);
  };

  const handleSavePayment = async (e) => {
    e.preventDefault();
    const amountNum = parseFloat(payForm.amount_paid);
    if (!amountNum || amountNum <= 0) {
      setFormError('Payment amount must be greater than zero.');
      return;
    }
    if (amountNum > parseFloat(activeFee.balance_amount)) {
      setFormError(`Payment amount (₹${amountNum}) cannot exceed outstanding balance (₹${activeFee.balance_amount}).`);
      return;
    }

    setActionLoading(true);
    setFormError('');
    try {
      const paymentRes = await hostelService.recordPayment({
        fee_record: activeFee.id,
        student: activeFee.student,
        amount_paid: payForm.amount_paid,
        payment_method: payForm.payment_method,
        transaction_reference: payForm.transaction_reference,
        remarks: payForm.remarks,
        recorded_by: payForm.recorded_by,
      });

      setShowPaymentModal(false);
      fetchFeesAndStudents();

      // Open printable receipt immediately
      setLastPayment({
        ...paymentRes,
        student_name: activeFee.student_name,
        student_code: activeFee.student_code,
        fee_title: activeFee.title,
      });
      setShowReceiptModal(true);
    } catch (err) {
      setFormError(err.message || 'Failed to record payment.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Student Fee Records & Billing</h1>
          <p className="page-subtitle">Track semester fees, outstanding dues, and record authorized offline payments</p>
        </div>
        <button onClick={handleOpenCreateFee} className="btn-primary-action">
          <Plus size={16} />
          <span>Generate New Fee Invoice</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="table-controls-bar">
        <div className="search-input-wrap">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by student name or student ID..."
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
            <option value="">All Payment Statuses</option>
            <option value="pending">Pending</option>
            <option value="partial">Partially Paid</option>
            <option value="paid">Fully Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Fees Table */}
      <div className="glass-table-container">
        <table className="glass-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Student ID</th>
              <th>Fee Title / Term</th>
              <th>Due Date</th>
              <th>Total Billed</th>
              <th>Amount Paid</th>
              <th>Balance Due</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="text-center py-6">Loading fee records...</td>
              </tr>
            ) : fees.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-6">No fee invoices found.</td>
              </tr>
            ) : (
              fees.map((fee) => (
                <tr key={fee.id}>
                  <td>
                    <strong>{fee.student_name}</strong>
                  </td>
                  <td>
                    <span className="font-mono text-xs">{fee.student_code}</span>
                  </td>
                  <td>
                    <div>{fee.title}</div>
                    <span className="text-xs text-muted">{fee.academic_term}</span>
                  </td>
                  <td>{fee.due_date}</td>
                  <td>₹ {Number(fee.total_amount).toLocaleString('en-IN')}</td>
                  <td className="text-green-600 font-semibold">
                    ₹ {Number(fee.amount_paid).toLocaleString('en-IN')}
                  </td>
                  <td className={Number(fee.balance_amount) > 0 ? 'text-red-500 font-bold' : 'text-muted'}>
                    ₹ {Number(fee.balance_amount).toLocaleString('en-IN')}
                  </td>
                  <td>
                    <span className={`status-pill-badge ${fee.status}`}>
                      {fee.status === 'paid' ? 'Fully Paid' : fee.status === 'partial' ? 'Partially Paid' : fee.status}
                    </span>
                  </td>
                  <td className="text-right">
                    {Number(fee.balance_amount) > 0 ? (
                      <button
                        onClick={() => handleOpenPayment(fee)}
                        className="btn-sm-action primary"
                        title="Record Payment"
                      >
                        <DollarSign size={14} />
                        <span>Pay Fee</span>
                      </button>
                    ) : (
                      <span className="text-xs text-green-600 font-bold">Settled</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Fee Modal */}
      <Modal
        isOpen={showCreateFeeModal}
        onClose={() => setShowCreateFeeModal(false)}
        title="Generate Student Fee Invoice"
      >
        <form onSubmit={handleSaveFee} className="modal-form">
          {formError && (
            <div className="form-error-banner">
              <AlertCircle size={16} />
              <span>{formError}</span>
            </div>
          )}

          <div className="modal-form-group">
            <label>Select Resident Student *</label>
            <select
              value={feeForm.student}
              onChange={(e) => setFeeForm({ ...feeForm, student: e.target.value })}
              required
            >
              <option value="">-- Choose Student --</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name} ({s.student_id}) {s.current_room ? `— Room ${s.current_room}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row-2">
            <div className="modal-form-group">
              <label>Fee Title</label>
              <input
                type="text"
                required
                value={feeForm.title}
                onChange={(e) => setFeeForm({ ...feeForm, title: e.target.value })}
              />
            </div>
            <div className="modal-form-group">
              <label>Academic Term</label>
              <input
                type="text"
                required
                value={feeForm.academic_term}
                onChange={(e) => setFeeForm({ ...feeForm, academic_term: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="modal-form-group">
              <label>Total Billed Amount (₹) *</label>
              <input
                type="number"
                step="100"
                required
                value={feeForm.total_amount}
                onChange={(e) => setFeeForm({ ...feeForm, total_amount: e.target.value })}
              />
            </div>
            <div className="modal-form-group">
              <label>Due Date *</label>
              <input
                type="date"
                required
                value={feeForm.due_date}
                onChange={(e) => setFeeForm({ ...feeForm, due_date: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-form-actions">
            <button
              type="button"
              onClick={() => setShowCreateFeeModal(false)}
              className="btn-modal-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="btn-modal-confirm btn-primary"
            >
              {actionLoading ? 'Generating...' : 'Generate Invoice'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Record Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title={`Record Authorized Payment — ${activeFee?.student_name}`}
      >
        <form onSubmit={handleSavePayment} className="modal-form">
          {formError && (
            <div className="form-error-banner">
              <AlertCircle size={16} />
              <span>{formError}</span>
            </div>
          )}

          <div className="modal-info-strip">
            <div><strong>Student:</strong> {activeFee?.student_name} ({activeFee?.student_code})</div>
            <div><strong>Invoice:</strong> {activeFee?.title}</div>
            <div><strong>Outstanding Balance:</strong> ₹ {Number(activeFee?.balance_amount).toLocaleString('en-IN')}</div>
          </div>

          <div className="form-row-2 mt-4">
            <div className="modal-form-group">
              <label>Amount Received (₹) *</label>
              <input
                type="number"
                step="1"
                required
                value={payForm.amount_paid}
                onChange={(e) => setPayForm({ ...payForm, amount_paid: e.target.value })}
              />
            </div>
            <div className="modal-form-group">
              <label>Payment Method</label>
              <select
                value={payForm.payment_method}
                onChange={(e) => setPayForm({ ...payForm, payment_method: e.target.value })}
              >
                <option value="bank_transfer">Bank Transfer / NEFT</option>
                <option value="upi_offline">UPI (QR Code Offline Verified)</option>
                <option value="cash">Cash (Front Desk)</option>
                <option value="cheque">Cheque / Demand Draft</option>
              </select>
            </div>
          </div>

          <div className="form-row-2">
            <div className="modal-form-group">
              <label>Transaction / Reference ID</label>
              <input
                type="text"
                value={payForm.transaction_reference}
                onChange={(e) => setPayForm({ ...payForm, transaction_reference: e.target.value })}
                placeholder="e.g. TXN-SBI-12345"
              />
            </div>
            <div className="modal-form-group">
              <label>Recorded By (Staff)</label>
              <input
                type="text"
                value={payForm.recorded_by}
                onChange={(e) => setPayForm({ ...payForm, recorded_by: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-form-group">
            <label>Payment Remarks</label>
            <input
              type="text"
              value={payForm.remarks}
              onChange={(e) => setPayForm({ ...payForm, remarks: e.target.value })}
            />
          </div>

          <div className="modal-form-actions">
            <button
              type="button"
              onClick={() => setShowPaymentModal(false)}
              className="btn-modal-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="btn-modal-confirm btn-primary"
            >
              {actionLoading ? 'Recording Payment...' : 'Record Payment & Print Receipt'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Printable Receipt Modal */}
      <PrintableReceiptModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        payment={lastPayment}
      />
    </div>
  );
}
