// src/components/common/Layout.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Layout = ({ children, title = 'Cricket Auction App' }) => {
  const location = useLocation();
  
  // Navigation links
  const navLinks = [
    { path: '/teams', label: 'Teams' },
    { path: '/players', label: 'Players' },
    { path: '/auction', label: 'Auction' },
    { path: '/results', label: 'Results' }
  ];
  
  // Check if a link is active
  const isActive = (path) => {
    return location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-blue-600 font-bold text-xl">ADA Premiere League</span>
              </div>
            </div>
            
            <nav className="flex items-center space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out ${
                    isActive(link.path)
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>
      
      {/* Page title */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </div>
      </div>
      
      {/* Main content */}
      <main className="flex-grow">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white shadow-inner">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Cricket Auction App
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;