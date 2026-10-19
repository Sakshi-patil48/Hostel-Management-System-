import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = '650px' }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-container-card"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header-bar">
          <h2 className="modal-title-text">{title}</h2>
          <button
            onClick={onClose}
            className="modal-close-icon-btn"
            aria-label="Close Modal"
          >
            <X size={18} />
          </button>
        </div>
        <div className="modal-body-scrollable">
          {children}
        </div>
      </div>
    </div>
  );
}
