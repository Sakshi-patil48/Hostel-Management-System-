import React, { useState, useEffect } from 'react';
import { hostelService } from '../services/hostelService';
import PrintableReceiptModal from '../components/PrintableReceiptModal';
import {
  History, Search, Printer, CheckCircle2, ShieldCheck,
  Calendar, FileText
} from 'lucide-react';

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await hostelService.getPayments({ search });
      setPayments(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [search]);

  const handleOpenReceipt = (payment) => {
    setSelectedPayment(payment);
    setShowReceiptModal(true);
  };

  return (
    <div className="page-wrapper">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Payment History & Living Receipts</h1>
          <p className="page-subtitle">Complete ledger of authorized fee payment transactions and printable vouchers</p>
        </div>
      </div>

      {/* Search */}
      <div className="table-controls-bar">
        <div className="search-input-wrap">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by receipt number, student name, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-table-container">
        <table className="glass-table">
          <thead>
            <tr>
              <th>Receipt No</th>
              <th>Student Name</th>
              <th>Student ID</th>
              <th>Fee Category</th>
              <th>Amount Paid</th>
              <th>Payment Date</th>
              <th>Method</th>
              <th>Verified By</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="text-center py-6">Loading transaction history...</td>
              </tr>
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-6">No payment records found.</td>
              </tr>
            ) : (
              payments.map((p) => (
                <tr key={p.id}>
                  <td>
                    <span className="font-mono text-bold text-blue-600">{p.receipt_number}</span>
                  </td>
                  <td>
                    <strong>{p.student_name}</strong>
                  </td>
                  <td>
                    <span className="font-mono text-xs">{p.student_code}</span>
                  </td>
                  <td>{p.fee_title || 'Semester Fee'}</td>
                  <td className="text-green-600 font-bold">
                    ₹ {Number(p.amount_paid).toLocaleString('en-IN')}
                  </td>
                  <td>{p.payment_date}</td>
                  <td>
                    <span className="capitalize">{p.payment_method?.replace('_', ' ')}</span>
                  </td>
                  <td>
                    <span className="text-xs text-muted">{p.recorded_by}</span>
                  </td>
                  <td className="text-right">
                    <button
                      onClick={() => handleOpenReceipt(p)}
                      className="btn-sm-action primary"
                      title="Print Official Receipt"
                    >
                      <Printer size={13} />
                      <span>Print Receipt</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Receipt Modal */}
      <PrintableReceiptModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        payment={selectedPayment}
      />
    </div>
  );
}
