// src/components/common/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { NAV_LINKS } from '../../utils/constants';

const Footer = ({ className = '' }) => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={`bg-gray-800 text-white py-8 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:justify-between items-center">
          {/* Logo and Copyright */}
          <div className="flex flex-col items-center md:items-start mb-6 md:mb-0">
            <div className="flex items-center">
              <svg 
                className="w-6 h-6 text-blue-400" 
                fill="currentColor" 
                viewBox="0 0 20 20" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" 
                  clipRule="evenodd" 
                />
              </svg>
              <span className="ml-2 text-lg font-bold">Cricket Auction</span>
            </div>
            <p className="mt-2 text-sm text-gray-400">
              &copy; {currentYear} Cricket Auction App. All rights reserved.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Scheduled for Tuesday, April 29th, 2025
            </p>
          </div>
          
          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center space-x-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-gray-300 hover:text-white transition duration-150 ease-in-out text-sm"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-700 text-center">
          <p className="text-sm text-gray-400">
            Built with React, Firebase, and Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;