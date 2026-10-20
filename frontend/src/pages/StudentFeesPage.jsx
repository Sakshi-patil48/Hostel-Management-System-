import React from 'react';
import { useFees } from '../hooks/useFees';
import { formatCurrency } from '../utils/formatters';
import Modal from '../components/common/Modal';
import SearchBar from '../components/common/SearchBar';
import StatusBadge from '../components/common/StatusBadge';
import FeedbackBanner from '../components/common/FeedbackBanner';
import PrintableReceiptModal from '../components/PrintableReceiptModal';
import { Plus, DollarSign, AlertCircle } from 'lucide-react';

export default function StudentFeesPage() {
  const {
    fees,
    students,
    loading,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    successMsg,
    setSuccessMsg,
    errorMsg,
    setErrorMsg,
    showCreateFeeModal,
    showPaymentModal,
    showReceiptModal,
    activeFee,
    lastPayment,
    feeForm,
    payForm,
    actionLoading,
    formError,
    openCreateFeeModal,
    openPaymentModal,
    closeModals,
    setFeeForm,
    setPayForm,
    saveFee,
    recordPayment,
  } = useFees();

  return (
    <div className="page-wrapper">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Student Fee Records & Billing</h1>
          <p className="page-subtitle">Track semester fees, outstanding dues, and record authorized offline payments</p>
        </div>
        <button onClick={openCreateFeeModal} className="btn-primary-action">
          <Plus size={16} />
          <span>Generate New Fee Invoice</span>
        </button>
      </div>

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

      {/* Filter and Search */}
      <div className="table-controls-bar">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by student name or student ID..."
        />

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
                  <td>{formatCurrency(fee.total_amount)}</td>
                  <td className="text-green-600 font-semibold">
                    {formatCurrency(fee.amount_paid)}
                  </td>
                  <td className={Number(fee.balance_amount) > 0 ? 'text-red-500 font-bold' : 'text-muted'}>
                    {formatCurrency(fee.balance_amount)}
                  </td>
                  <td>
                    <StatusBadge
                      status={fee.status}
                      label={fee.status === 'paid' ? 'Fully Paid' : fee.status === 'partial' ? 'Partially Paid' : fee.status}
                    />
                  </td>
                  <td className="text-right">
                    {Number(fee.balance_amount) > 0 ? (
                      <button
                        onClick={() => openPaymentModal(fee)}
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
        onClose={closeModals}
        title="Generate Student Fee Invoice"
      >
        <form onSubmit={saveFee} className="modal-form">
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
              {actionLoading ? 'Generating...' : 'Generate Invoice'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Record Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={closeModals}
        title={`Record Authorized Payment — ${activeFee?.student_name}`}
      >
        <form onSubmit={recordPayment} className="modal-form">
          {formError && (
            <div className="form-error-banner">
              <AlertCircle size={16} />
              <span>{formError}</span>
            </div>
          )}

          <div className="modal-info-strip">
            <div><strong>Student:</strong> {activeFee?.student_name} ({activeFee?.student_code})</div>
            <div><strong>Invoice:</strong> {activeFee?.title}</div>
            <div><strong>Outstanding Balance:</strong> {formatCurrency(activeFee?.balance_amount)}</div>
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
              {actionLoading ? 'Recording Payment...' : 'Record Payment & Print Receipt'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Printable Receipt Modal */}
      <PrintableReceiptModal
        isOpen={showReceiptModal}
        onClose={closeModals}
        payment={lastPayment}
      />
    </div>
  );
}
