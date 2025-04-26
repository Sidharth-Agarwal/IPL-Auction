// src/layouts/MainLayout.jsx
import React from 'react';
import PropTypes from 'prop-types';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

const MainLayout = ({ 
  children, 
  containerClassName = '', 
  showHeader = true, 
  showFooter = true,
  containerType = 'default' // 'default', 'fluid', 'none'
}) => {
  // Container classes based on type
  const containerClasses = {
    default: 'container mx-auto px-4 sm:px-6 lg:px-8 py-8',
    fluid: 'w-full px-4 sm:px-6 lg:px-8 py-8',
    none: ''
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {showHeader && <Header />}
      
      <main className={`flex-grow ${containerClasses[containerType] || containerClasses.default} ${containerClassName}`}>
        {children}
      </main>
      
      {showFooter && <Footer />}
    </div>
  );
};

MainLayout.propTypes = {
  children: PropTypes.node.isRequired,
  containerClassName: PropTypes.string,
  showHeader: PropTypes.bool,
  showFooter: PropTypes.bool,
  containerType: PropTypes.oneOf(['default', 'fluid', 'none'])
};

export default MainLayout;