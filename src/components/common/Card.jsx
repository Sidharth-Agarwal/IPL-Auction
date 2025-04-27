// src/components/common/Card.jsx
import React from 'react';
import PropTypes from 'prop-types';

const Card = ({ 
  children, 
  title,
  subtitle,
  footer,
  className = '',
  padding = 'normal',
  bordered = true,
  elevation = 'md',
  background = 'white',
  titleAlignment = 'left',
  titleVariant = 'default',
  actions,
  onClick = null,
  id
}) => {
  const paddingClasses = {
    none: '',
    xs: 'p-1',
    sm: 'p-2',
    normal: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  };

  const elevationClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };

  const backgroundClasses = {
    white: 'bg-white',
    gray: 'bg-gray-50',
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    red: 'bg-red-50',
    yellow: 'bg-yellow-50',
    transparent: 'bg-transparent'
  };

  const titleAlignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  const titleVariantClasses = {
    default: 'bg-gray-50 border-b',
    primary: 'bg-blue-600 text-white border-b',
    success: 'bg-green-600 text-white border-b',
    warning: 'bg-yellow-500 text-white border-b',
    danger: 'bg-red-600 text-white border-b',
    info: 'bg-blue-400 text-white border-b',
    transparent: ''
  };

  const borderClasses = bordered ? 'border border-gray-200' : '';
  const cursorClasses = onClick ? 'cursor-pointer transition-all hover:shadow-lg' : '';
  
  const handleClick = () => {
    if (onClick) onClick();
  };

  return (
    <div 
      className={`rounded-lg overflow-hidden ${backgroundClasses[background] || backgroundClasses.white} ${elevationClasses[elevation] || elevationClasses.md} ${borderClasses} ${cursorClasses} ${className}`}
      onClick={handleClick}
      id={id}
    >
      {/* Card Title */}
      {(title || actions) && (
        <div className={`${titleVariantClasses[titleVariant] || titleVariantClasses.default} px-4 py-3 flex justify-between items-center`}>
          <div className={`${titleAlignmentClasses[titleAlignment] || titleAlignmentClasses.left} flex-1`}>
            {typeof title === 'string' ? (
              <>
                <h3 className="text-lg font-medium">{title}</h3>
                {subtitle && <p className="text-sm opacity-75 mt-0.5">{subtitle}</p>}
              </>
            ) : (
              title
            )}
          </div>
          
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>
      )}
      
      {/* Card Content */}
      <div className={paddingClasses[padding] || paddingClasses.normal}>
        {children}
      </div>
      
      {/* Card Footer */}
      {footer && (
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  subtitle: PropTypes.string,
  footer: PropTypes.node,
  className: PropTypes.string,
  padding: PropTypes.oneOf(['none', 'xs', 'sm', 'normal', 'lg', 'xl']),
  bordered: PropTypes.bool,
  elevation: PropTypes.oneOf(['none', 'sm', 'md', 'lg', 'xl']),
  background: PropTypes.oneOf(['white', 'gray', 'blue', 'green', 'red', 'yellow', 'transparent']),
  titleAlignment: PropTypes.oneOf(['left', 'center', 'right']),
  titleVariant: PropTypes.oneOf(['default', 'primary', 'success', 'warning', 'danger', 'info', 'transparent']),
  actions: PropTypes.node,
  onClick: PropTypes.func,
  id: PropTypes.string
};

export default Card;