// src/layouts/AdminLayout.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { ADMIN_TABS } from '../utils/constants';

const AdminLayout = ({ 
  children,
  activeTab,
  onTabChange,
  title = 'Admin Dashboard',
  description = 'Manage players, teams, and auction settings'
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // If activeTab not provided, try to infer from URL query parameter
  const inferActiveTab = () => {
    if (activeTab) return activeTab;
    
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    
    if (tabParam && ADMIN_TABS.some(tab => tab.id === tabParam)) {
      return tabParam;
    }
    
    return ADMIN_TABS[0].id;
  };
  
  const currentTab = inferActiveTab();

  const handleTabChange = (tabId) => {
    // Close sidebar on mobile
    setIsSidebarOpen(false);
    
    // Update URL
    navigate(`/admin?tab=${tabId}`);
    
    // Call the callback if provided
    if (onTabChange) {
      onTabChange(tabId);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      {/* Admin Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <p className="text-gray-600">{description}</p>
            </div>
            
            {/* Mobile sidebar toggle */}
            <button
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <span className="sr-only">Toggle sidebar</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar (Desktop) */}
          <aside className="hidden md:block w-64 bg-white p-4 rounded-lg shadow">
            <nav className="space-y-1">
              {ADMIN_TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full text-left px-4 py-2 rounded-md flex items-center ${
                    currentTab === tab.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <Link
                to="/"
                className="px-4 py-2 rounded-md flex items-center text-gray-700 hover:bg-gray-50"
              >
                ← Back to Home
              </Link>
            </div>
          </aside>
          
          {/* Sidebar (Mobile) */}
          {isSidebarOpen && (
            <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true">
              {/* Background overlay */}
              <div 
                className="fixed inset-0 bg-gray-600 bg-opacity-75" 
                aria-hidden="true"
                onClick={() => setIsSidebarOpen(false)}
              ></div>
              
              {/* Sidebar */}
              <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                  <button
                    type="button"
                    className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <span className="sr-only">Close sidebar</span>
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                  <div className="px-4">
                    <h2 className="text-lg font-medium text-gray-900">{title}</h2>
                  </div>
                  <nav className="mt-5 px-2 space-y-1">
                    {ADMIN_TABS.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`w-full text-left px-3 py-2 rounded-md flex items-center ${
                          currentTab === tab.id
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>
                
                <div className="flex-shrink-0 p-4 border-t border-gray-200">
                  <Link
                    to="/"
                    className="px-4 py-2 rounded-md flex items-center text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    ← Back to Home
                  </Link>
                </div>
              </div>
              
              <div className="flex-shrink-0 w-14">{/* Spacer element */}</div>
            </div>
          )}
          
          {/* Main Content */}
          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

AdminLayout.propTypes = {
  children: PropTypes.node.isRequired,
  activeTab: PropTypes.string,
  onTabChange: PropTypes.func,
  title: PropTypes.string,
  description: PropTypes.string
};

export default AdminLayout;