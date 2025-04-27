// src/components/common/Modal.jsx
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Button from './Button';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnEsc = true,
  closeOnOverlayClick = true,
  showCloseButton = true,
  closeButtonLabel = 'Close',
  isLoading = false,
  className = '',
  contentClassName = '',
}) => {
  const modalRef = useRef(null);

  // Close modal when Escape key is pressed
  useEffect(() => {
    const handleEscKey = (event) => {
      if (closeOnEsc && isOpen && event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      // Restore body scroll when modal is closed
      document.body.style.overflow = 'visible';
    };
  }, [isOpen, onClose, closeOnEsc]);

  // Handle click outside of modal content
  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  // Size classes - Updated with wider max-width values
  const sizeClasses = {
    sm: 'max-w-lg', // Increased from max-w-md
    md: 'max-w-2xl', // Increased from max-w-lg
    lg: 'max-w-4xl', // Increased from max-w-2xl
    xl: 'max-w-6xl', // Increased from max-w-4xl
    full: 'max-w-full mx-4'
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby={title ? 'modal-title' : undefined}
      role="dialog"
      aria-modal="true"
    >
      {/* Modal Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
        onClick={handleOverlayClick}
      />
      
      {/* Modal Container */}
      <div className="flex items-end sm:items-center justify-center min-h-screen p-4 text-center sm:p-0">
        {/* Modal Content */}
        <div 
          className={`relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 w-full ${sizeClasses[size] || sizeClasses.md} ${className}`}
          ref={modalRef}
        >
          {/* Modal Header */}
          {title && (
            <div className="bg-gray-50 px-4 py-3 sm:px-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                {title}
              </h3>
              {showCloseButton && (
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={onClose}
                  aria-label="Close modal"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}
          
          {/* Modal Body */}
          <div className={`px-4 py-4 sm:p-6 ${contentClassName}`}>
            {isLoading ? (
              <div className="flex justify-center py-6">
                <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : (
              children
            )}
          </div>
          
          {/* Modal Footer */}
          {(footer || showCloseButton) && (
            <div className="bg-gray-50 px-4 py-3 sm:px-6 border-t border-gray-200 flex flex-shrink-0 flex-wrap justify-end gap-2">
              {showCloseButton && !footer && (
                <Button 
                  variant="secondary" 
                  onClick={onClose}
                  size="sm"
                >
                  {closeButtonLabel}
                </Button>
              )}
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;