// src/components/common/Header.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAV_LINKS } from '../../utils/constants';
import { formatAuctionCountdown } from '../../utils/formatters';
import { getAuctionSettings } from '../../services/auctionService';

const Header = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [auctionDate, setAuctionDate] = useState(null);
  const [showCountdown, setShowCountdown] = useState(false);
  
  // Load auction date
  useEffect(() => {
    const fetchAuctionDate = async () => {
      try {
        const settings = await getAuctionSettings();
        if (settings && settings.auctionDate) {
          const date = settings.auctionDate.toDate ? 
                      settings.auctionDate.toDate() : 
                      new Date(settings.auctionDate);
                      
          setAuctionDate(date);
          
          // Show countdown only if auction is in the future
          if (date > new Date()) {
            setShowCountdown(true);
          }
        }
      } catch (error) {
        console.error('Error fetching auction date:', error);
      }
    };
    
    fetchAuctionDate();
    
    // Set up interval to update the countdown every minute
    const intervalId = setInterval(() => {
      if (auctionDate && auctionDate > new Date()) {
        // Force re-render to update countdown
        setAuctionDate(new Date(auctionDate.getTime()));
      } else if (auctionDate && auctionDate <= new Date() && showCountdown) {
        setShowCountdown(false);
      }
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, [auctionDate]);
  
  // Function to check if a link is active
  const isActiveLink = (path) => {
    return location.pathname === path || 
           (path !== '/' && location.pathname.startsWith(path));
  };

  // Toggle mobile menu
  const toggleMenu = () => setIsOpen(!isOpen);
  
  return (
    <header className="bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <svg 
              className="w-8 h-8" 
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
            <span className="text-xl font-bold">Cricket Auction</span>
            
            {/* Auction Countdown */}
            {showCountdown && auctionDate && (
              <div className="hidden md:flex items-center ml-4">
                <span className="px-2 py-1 text-xs font-medium bg-blue-800 text-white rounded-md">
                  {formatAuctionCountdown(auctionDate)}
                </span>
              </div>
            )}
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out ${
                  isActiveLink(link.path)
                    ? 'bg-blue-800 text-white'
                    : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                }`}
                aria-current={isActiveLink(link.path) ? 'page' : undefined}
              >
                {link.name}
              </Link>
            ))}
          </nav>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            {showCountdown && auctionDate && (
              <div className="mr-2">
                <span className="px-2 py-1 text-xs font-medium bg-blue-800 text-white rounded-md">
                  {formatAuctionCountdown(auctionDate)}
                </span>
              </div>
            )}
            <button 
              className="inline-flex items-center justify-center p-2 rounded-md text-blue-100 hover:text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={toggleMenu}
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {/* Icon when menu is closed */}
              {!isOpen && (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
              {/* Icon when menu is open */}
              {isOpen && (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu, show/hide based on menu state */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActiveLink(link.path)
                  ? 'bg-blue-800 text-white'
                  : 'text-blue-100 hover:bg-blue-800 hover:text-white'
              }`}
              aria-current={isActiveLink(link.path) ? 'page' : undefined}
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Header;