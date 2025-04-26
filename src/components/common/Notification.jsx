// src/components/common/Notification.jsx
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const Notification = ({
  id,
  type = 'info',
  message,
  title,
  onClose,
  duration = 5000,
  position = 'top-right'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  
  useEffect(() => {
    // Entrance animation
    const entranceTimeout = setTimeout(() => {
      setIsVisible(true);
    }, 10); // Small delay for the DOM to be ready
    
    // Set auto-dismiss timeout if duration is provided
    let dismissTimeout;
    if (duration > 0) {
      dismissTimeout = setTimeout(() => {
        handleClose();
      }, duration);
    }
    
    return () => {
      clearTimeout(entranceTimeout);
      if (dismissTimeout) clearTimeout(dismissTimeout);
    };
  }, [duration]);
  
  // Handle close with exit animation
  const handleClose = () => {
    setIsLeaving(true);
    // Wait for animation to complete before fully removing
    setTimeout(() => {
      if (onClose) onClose(id);
    }, 300); // Match the CSS transition duration
  };
  
  // Type-based styling
  const typeStyles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      iconBg: 'bg-green-400',
      title: title || 'Success',
      titleColor: 'text-green-800',
      textColor: 'text-green-700'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      iconBg: 'bg-red-400',
      title: title || 'Error',
      titleColor: 'text-red-800',
      textColor: 'text-red-700'
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      iconBg: 'bg-yellow-400',
      title: title || 'Warning',
      titleColor: 'text-yellow-800',
      textColor: 'text-yellow-700'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      iconBg: 'bg-blue-400',
      title: title || 'Information',
      titleColor: 'text-blue-800',
      textColor: 'text-blue-700'
    }
  };
  
  const styles = typeStyles[type] || typeStyles.info;
  
  // CSS to handle animation and positioning
  const baseClasses = `max-w-sm w-full shadow-lg rounded-lg pointer-events-auto border ${styles.border} ${styles.bg} overflow-hidden`;
  const animationClasses = `transform transition duration-300 ease-in-out ${
    isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
  } ${isLeaving ? 'translate-x-full opacity-0' : ''}`;
  
  // Render appropriate icon based on notification type
  const renderIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className={`${baseClasses} ${animationClasses} my-2`} role="alert" aria-live="assertive">
      <div className="flex items-start p-4">
        <div className={`flex-shrink-0 h-10 w-10 rounded-full ${styles.iconBg} flex items-center justify-center mr-4`}>
          {renderIcon()}
        </div>
        <div className="flex-1 pt-0.5">
          <p className={`text-sm font-medium ${styles.titleColor}`}>{styles.title}</p>
          <p className={`mt-1 text-sm ${styles.textColor}`}>{message}</p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            type="button"
            className={`bg-transparent rounded-md inline-flex ${styles.textColor} hover:opacity-75 focus:outline-none`}
            onClick={handleClose}
          >
            <span className="sr-only">Close</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Progress bar for auto-dismiss */}
      {duration > 0 && (
        <div className="h-1 w-full bg-gray-200">
          <div 
            className={`h-full ${type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}`}
            style={{ 
              width: '100%', 
              animation: `notification-timer ${duration}ms linear` 
            }}
          />
        </div>
      )}

      {/* Add keyframes using a style tag instead of JSX attribute */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes notification-timer {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}} />
    </div>
  );
};

Notification.propTypes = {
  id: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  message: PropTypes.string.isRequired,
  title: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  duration: PropTypes.number,
  position: PropTypes.oneOf([
    'top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center'
  ])
};

export default Notification;