// src/components/common/Card.js
import React from 'react';

const Card = ({ 
  children, 
  title,
  footer,
  className = '',
  padding = 'normal'
}) => {
  const paddingClasses = {
    none: '',
    small: 'p-2',
    normal: 'p-4',
    large: 'p-6'
  };

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {title && (
        <div className="bg-gray-50 px-4 py-3 border-b">
          {typeof title === 'string' ? (
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          ) : (
            title
          )}
        </div>
      )}
      
      <div className={paddingClasses[padding] || paddingClasses.normal}>
        {children}
      </div>
      
      {footer && (
        <div className="bg-gray-50 px-4 py-3 border-t">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;