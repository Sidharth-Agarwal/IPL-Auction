// src/components/common/Button.jsx
import React from 'react';
import PropTypes from 'prop-types';

const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  disabled = false,
  className = '',
  size = 'md',
  fullWidth = false,
  icon = null,
  iconPosition = 'left',
  loading = false,
  loadingText = 'Loading...',
  rounded = 'md'
}) => {
  const baseClasses = 'font-semibold focus:outline-none transition-colors inline-flex items-center justify-center';
  
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white border border-blue-600 shadow-sm',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 border border-gray-300',
    success: 'bg-green-600 hover:bg-green-700 text-white border border-green-600 shadow-sm',
    danger: 'bg-red-600 hover:bg-red-700 text-white border border-red-600 shadow-sm',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white border border-yellow-500 shadow-sm',
    info: 'bg-blue-400 hover:bg-blue-500 text-white border border-blue-400 shadow-sm',
    outline: 'bg-transparent hover:bg-gray-100 text-blue-600 border border-blue-600',
    'outline-danger': 'bg-transparent hover:bg-red-50 text-red-600 border border-red-600',
    'outline-success': 'bg-transparent hover:bg-green-50 text-green-600 border border-green-600',
    link: 'bg-transparent hover:underline text-blue-600 border-none shadow-none'
  };
  
  const sizeClasses = {
    xs: 'py-1 px-2 text-xs',
    sm: 'py-1.5 px-3 text-sm', // Slightly adjusted for header buttons
    md: 'py-2 px-4 text-base',
    lg: 'py-2.5 px-5 text-lg',
    xl: 'py-3 px-6 text-xl',
    // Added header specific size
    header: 'py-1 px-3 text-sm'
  };
  
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full'
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  const iconSpacing = children ? (iconPosition === 'left' ? 'mr-2' : 'ml-2') : '';
  
  const classes = `
    ${baseClasses}
    ${variantClasses[variant] || variantClasses.primary}
    ${sizeClasses[size] || sizeClasses.md}
    ${roundedClasses[rounded] || roundedClasses.md}
    ${widthClass}
    ${disabledClass}
    ${className}
  `;

  // Spinner for loading state
  const renderSpinner = () => (
    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={classes.trim()}
      aria-busy={loading}
    >
      {loading && renderSpinner()}
      {!loading && icon && iconPosition === 'left' && <span className={iconSpacing}>{icon}</span>}
      {loading ? loadingText : children}
      {!loading && icon && iconPosition === 'right' && <span className={iconSpacing}>{icon}</span>}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  variant: PropTypes.oneOf([
    'primary', 'secondary', 'success', 'danger', 
    'warning', 'info', 'outline', 'outline-danger', 
    'outline-success', 'link'
  ]),
  disabled: PropTypes.bool,
  className: PropTypes.string,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', 'header']),
  fullWidth: PropTypes.bool,
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  loading: PropTypes.bool,
  loadingText: PropTypes.string,
  rounded: PropTypes.oneOf(['none', 'sm', 'md', 'lg', 'xl', 'full'])
};

export default Button;