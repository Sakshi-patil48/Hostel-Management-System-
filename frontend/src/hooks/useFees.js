import { useState, useEffect, useCallback } from 'react';
import { feesApi } from '../services/api/fees.api';
import { studentsApi } from '../services/api/students.api';

const DEFAULT_FEE_FORM = {
  student: '',
  title: 'Fall Semester 2026 Hostel & Mess Fee',
  academic_term: 'Fall Term 2026',
  total_amount: '48000.00',
  due_date: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
};

const DEFAULT_PAY_FORM = {
  amount_paid: '',
  payment_method: 'bank_transfer',
  transaction_reference: '',
  remarks: 'Authorized front-desk verified payment.',
  recorded_by: 'Hostel Accounts Desk',
};

/**
 * Custom hook to manage Hostel Fees and Payment Collection business logic
 */
export function useFees() {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Modals
  const [showCreateFeeModal, setShowCreateFeeModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [activeFee, setActiveFee] = useState(null);
  const [lastPayment, setLastPayment] = useState(null);

  // Forms
  const [feeForm, setFeeForm] = useState(DEFAULT_FEE_FORM);
  const [payForm, setPayForm] = useState(DEFAULT_PAY_FORM);
  const [actionLoading, setActionLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchFeesAndStudents = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const [feesRes, studentsRes] = await Promise.all([
        feesApi.getFees({ search, status: statusFilter }),
        studentsApi.getStudents({ status: 'active' }),
      ]);
      setFees(feesRes || []);
      setStudents(studentsRes || []);
    } catch (err) {
      setErrorMsg(err.message || 'Unable to load fees or student directory.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchFeesAndStudents();
  }, [fetchFeesAndStudents]);

  const openCreateFeeModal = useCallback(() => {
    setFeeForm({
      ...DEFAULT_FEE_FORM,
      student: students[0]?.id || '',
    });
    setFormError('');
    setShowCreateFeeModal(true);
  }, [students]);

  const openPaymentModal = useCallback((fee) => {
    setActiveFee(fee);
    setPayForm({
      amount_paid: fee.balance_amount ? String(fee.balance_amount) : '',
      payment_method: 'bank_transfer',
      transaction_reference: `TXN-${Date.now().toString().slice(-6)}`,
      remarks: 'Student fee installment receipt verified.',
      recorded_by: 'Hostel Accounts Desk',
    });
    setFormError('');
    setShowPaymentModal(true);
  }, []);

  const openReceiptModal = useCallback((fee, payment) => {
    setActiveFee(fee);
    setLastPayment(payment);
    setShowReceiptModal(true);
  }, []);

  const closeModals = useCallback(() => {
    setShowCreateFeeModal(false);
    setShowPaymentModal(false);
    setShowReceiptModal(false);
    setActiveFee(null);
    setFormError('');
  }, []);

  const saveFee = useCallback(async (e) => {
    if (e) e.preventDefault();
    if (!feeForm.student) {
      setFormError('Please select a student.');
      return;
    }
    setActionLoading(true);
    setFormError('');
    try {
      await feesApi.createFee(feeForm);
      setSuccessMsg('Fee invoice generated successfully!');
      closeModals();
      await fetchFeesAndStudents();
      setTimeout(() => setSuccessMsg(''), 4500);
    } catch (err) {
      setFormError(err.message || 'Error generating fee record.');
    } finally {
      setActionLoading(false);
    }
  }, [feeForm, closeModals, fetchFeesAndStudents]);

  const recordPayment = useCallback(async (e) => {
    if (e) e.preventDefault();
    const amount = parseFloat(payForm.amount_paid);
    if (isNaN(amount) || amount <= 0) {
      setFormError('Please enter a valid payment amount greater than 0.');
      return;
    }
    setActionLoading(true);
    setFormError('');
    try {
      const payload = {
        fee_record: activeFee.id,
        student: activeFee.student,
        amount_paid: amount.toFixed(2),
        payment_method: payForm.payment_method,
        transaction_reference: payForm.transaction_reference.trim(),
        remarks: payForm.remarks.trim(),
        recorded_by: payForm.recorded_by.trim() || 'Accounts Desk',
      };
      const responsePayment = await feesApi.recordPayment(payload);
      setShowPaymentModal(false);
      setSuccessMsg(`Payment of ₹${amount.toLocaleString('en-IN')} recorded successfully!`);

      // Open receipt automatically
      openReceiptModal(activeFee, responsePayment);
      await fetchFeesAndStudents();
      setTimeout(() => setSuccessMsg(''), 4500);
    } catch (err) {
      setFormError(err.message || 'Error recording payment.');
    } finally {
      setActionLoading(false);
    }
  }, [payForm, activeFee, openReceiptModal, fetchFeesAndStudents]);

  return {
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
    openReceiptModal,
    closeModals,
    setFeeForm,
    setPayForm,
    saveFee,
    recordPayment,
    refreshFees: fetchFeesAndStudents,
  };
}

export default useFees;
