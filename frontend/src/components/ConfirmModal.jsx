import React from 'react';
import Modal from './Modal';
import { AlertTriangle, Info } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmation Required',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = false,
  loading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="480px">
      <div className="confirm-modal-body">
        <div className={`confirm-icon-wrapper ${isDanger ? 'danger' : 'info'}`}>
          {isDanger ? <AlertTriangle size={24} /> : <Info size={24} />}
        </div>
        <p className="confirm-message-text">{message}</p>

        <div className="confirm-actions-row">
          <button
            onClick={onClose}
            disabled={loading}
            className="btn-modal-cancel"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`btn-modal-confirm ${isDanger ? 'btn-danger' : 'btn-primary'}`}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
