// src/components/common/ErrorMessage.jsx
import React from 'react';
import PropTypes from 'prop-types';

const ErrorMessage = ({
  message,
  onDismiss,
  variant = 'error',
  title,
  bordered = true,
  showIcon = true,
  className = '',
  testId = 'error-message'
}) => {
  if (!message) return null;
  
  // Define different variant styles
  const variantStyles = {
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      iconColor: 'text-red-400',
      title: title || 'Error',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-700',
      iconColor: 'text-yellow-400',
      title: title || 'Warning',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      iconColor: 'text-blue-400',
      title: title || 'Information',
    }
  };
  
  const styles = variantStyles[variant] || variantStyles.error;
  const borderStyle = bordered ? `border ${styles.border}` : '';
  
  return (
    <div 
      className={`${styles.bg} ${borderStyle} ${styles.text} px-4 py-3 rounded-md mt-1 mb-4 ${className}`}
      data-testid={testId}
      role="alert"
    >
      <div className="flex">
        {showIcon && (
          <div className="flex-shrink-0">
            {variant === 'error' && (
              <svg className={`h-5 w-5 ${styles.iconColor}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            {variant === 'warning' && (
              <svg className={`h-5 w-5 ${styles.iconColor}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            {variant === 'info' && (
              <svg className={`h-5 w-5 ${styles.iconColor}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        )}
        <div className={`${showIcon ? 'ml-3' : ''} flex-1`}>
          {styles.title && (
            <h3 className="text-sm font-medium mb-1">{styles.title}</h3>
          )}
          <div className="text-sm">
            {typeof message === 'string' ? (
              <p>{message}</p>
            ) : (
              message
            )}
          </div>
        </div>
        {onDismiss && (
          <div>
            <button
              type="button"
              className={`${styles.text} hover:opacity-75 focus:outline-none`}
              onClick={onDismiss}
              aria-label="Dismiss"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

ErrorMessage.propTypes = {
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  onDismiss: PropTypes.func,
  variant: PropTypes.oneOf(['error', 'warning', 'info']),
  title: PropTypes.string,
  bordered: PropTypes.bool,
  showIcon: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string
};

export default ErrorMessage;