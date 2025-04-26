// src/components/common/Loading.jsx
import React from 'react';
import PropTypes from 'prop-types';

const Loading = ({
  size = 'md',
  color = 'blue',
  text = 'Loading...',
  fullScreen = false,
  overlay = false,
  className = '',
  textSize = 'default',
  variant = 'spinner'
}) => {
  const sizeClasses = {
    xs: 'h-4 w-4',
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const colorClasses = {
    blue: 'text-blue-600',
    red: 'text-red-600',
    green: 'text-green-600',
    yellow: 'text-yellow-500',
    gray: 'text-gray-500',
    white: 'text-white'
  };
  
  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    default: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };
  
  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center z-50'
    : 'flex flex-col items-center justify-center';
  
  const overlayClasses = overlay && fullScreen
    ? 'bg-black bg-opacity-50'
    : '';
  
  const renderSpinner = () => (
    <svg 
      className={`animate-spin ${sizeClasses[size] || sizeClasses.md} ${colorClasses[color] || colorClasses.blue}`} 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
  
  const renderPulse = () => (
    <div className="flex space-x-2">
      <div className={`${sizeClasses[size] || sizeClasses.md} rounded-full ${colorClasses[color] || colorClasses.blue} opacity-75 animate-pulse`}></div>
      <div className={`${sizeClasses[size] || sizeClasses.md} rounded-full ${colorClasses[color] || colorClasses.blue} opacity-75 animate-pulse delay-75`}></div>
      <div className={`${sizeClasses[size] || sizeClasses.md} rounded-full ${colorClasses[color] || colorClasses.blue} opacity-75 animate-pulse delay-150`}></div>
    </div>
  );
  
  const renderDotsFlashing = () => (
    <div className="flex space-x-1">
      <div className={`${sizeClasses[size] || sizeClasses.md} rounded-full ${colorClasses[color] || colorClasses.blue} animate-ping`}></div>
      <div className={`${sizeClasses[size] || sizeClasses.md} rounded-full ${colorClasses[color] || colorClasses.blue} animate-ping delay-100`}></div>
      <div className={`${sizeClasses[size] || sizeClasses.md} rounded-full ${colorClasses[color] || colorClasses.blue} animate-ping delay-200`}></div>
    </div>
  );
  
  // Render different loading animations based on variant
  const renderLoadingAnimation = () => {
    switch (variant) {
      case 'pulse':
        return renderPulse();
      case 'dots':
        return renderDotsFlashing();
      case 'spinner':
      default:
        return renderSpinner();
    }
  };

  return (
    <div className={`${containerClasses} ${overlayClasses} ${className}`} role="status">
      {renderLoadingAnimation()}
      {text && (
        <p className={`mt-2 ${textSizeClasses[textSize] || textSizeClasses.default} ${colorClasses[color] || colorClasses.blue}`}>
          {text}
        </p>
      )}
      <span className="sr-only">Loading...</span>
    </div>
  );
};

Loading.propTypes = {
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  color: PropTypes.oneOf(['blue', 'red', 'green', 'yellow', 'gray', 'white']),
  text: PropTypes.string,
  fullScreen: PropTypes.bool,
  overlay: PropTypes.bool,
  className: PropTypes.string,
  textSize: PropTypes.oneOf(['xs', 'sm', 'default', 'lg', 'xl']),
  variant: PropTypes.oneOf(['spinner', 'pulse', 'dots'])
};

export default Loading;