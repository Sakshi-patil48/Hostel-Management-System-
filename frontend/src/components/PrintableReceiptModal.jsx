import React, { useRef } from 'react';
import Modal from './Modal';
import { Printer, Download, CheckCircle, ShieldCheck } from 'lucide-react';

export default function PrintableReceiptModal({ isOpen, onClose, payment }) {
  const receiptRef = useRef(null);

  if (!payment) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Authorized Payment Receipt" maxWidth="620px">
      <div className="receipt-print-wrapper" ref={receiptRef}>
        <div className="receipt-print-card">
          {/* Header */}
          <div className="receipt-header">
            <div className="receipt-logo-title">
              <span className="receipt-badge-3d">HOSTEL</span>
              <h3>COLLEGE HOSTEL MANAGEMENT SYSTEM</h3>
              <p>Campus Residency & Student Housing Directorate</p>
            </div>
            <div className="receipt-no-block">
              <span className="receipt-label">RECEIPT NUMBER</span>
              <strong className="receipt-code">{payment.receipt_number}</strong>
              <span className="receipt-date">Date: {payment.payment_date}</span>
            </div>
          </div>

          <div className="receipt-divider" />

          {/* Student Info Grid */}
          <div className="receipt-info-grid">
            <div className="receipt-info-col">
              <span className="r-label">Student Name:</span>
              <strong className="r-val">{payment.student_name}</strong>
            </div>
            <div className="receipt-info-col">
              <span className="r-label">Student ID:</span>
              <strong className="r-val">{payment.student_code}</strong>
            </div>
            <div className="receipt-info-col">
              <span className="r-label">Fee Purpose:</span>
              <span className="r-val">{payment.fee_title || 'Hostel & Mess Term Fee'}</span>
            </div>
            <div className="receipt-info-col">
              <span className="r-label">Payment Method:</span>
              <span className="r-val text-capitalize">{payment.payment_method?.replace('_', ' ')}</span>
            </div>
            {payment.transaction_reference && (
              <div className="receipt-info-col full-width">
                <span className="r-label">Transaction Reference:</span>
                <span className="r-val font-mono">{payment.transaction_reference}</span>
              </div>
            )}
          </div>

          {/* Payment Amount Box */}
          <div className="receipt-amount-banner">
            <div className="amount-label-group">
              <span>Amount Received</span>
              <small>Offline Authorized & Verified</small>
            </div>
            <div className="amount-figure">
              ₹ {Number(payment.amount_paid).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>

          {/* Footer & Signature */}
          <div className="receipt-footer-row">
            <div className="verified-seal">
              <ShieldCheck size={18} className="text-green-600" />
              <span>Verified by: {payment.recorded_by || 'Accounts Desk'}</span>
            </div>
            <div className="authorized-sign-box">
              <div className="sign-line" />
              <span>Authorized Signature / Warden Stamp</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="receipt-actions no-print">
          <button onClick={handlePrint} className="btn-print-receipt">
            <Printer size={16} />
            <span>Print / Save as PDF</span>
          </button>
          <button onClick={onClose} className="btn-secondary-receipt">
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
