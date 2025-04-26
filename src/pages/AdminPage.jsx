// src/pages/AdminPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import AdminDashboard from '../components/admin/AdminDashboard';
import TeamForm from '../components/admin/TeamForm';
import PlayerImport from '../components/admin/PlayerImport';
import AuctionControls from '../components/admin/AuctionControls';
import { ADMIN_TABS } from '../utils/constants';
import { useNotification } from '../context/NotificationContext';

const AdminPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showSuccess } = useNotification();
  
  // Get the active tab from URL query parameter
  const getTabFromUrl = () => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    
    if (tabParam && ADMIN_TABS.some(tab => tab.id === tabParam)) {
      return tabParam;
    }
    
    return 'dashboard'; // Default tab
  };
  
  const [activeTab, setActiveTab] = useState(getTabFromUrl());
  
  // Update active tab when URL changes
  useEffect(() => {
    setActiveTab(getTabFromUrl());
  }, [location.search]);
  
  // Handle tab change
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    navigate(`/admin?tab=${tabId}`);
  };
  
  // Handle dashboard action clicks
  const handleDashboardAction = (actionTab) => {
    handleTabChange(actionTab);
  };
  
  // Handle team creation success
  const handleTeamCreated = (team) => {
    showSuccess(`Team "${team.name}" created successfully!`);
  };
  
  // Handle player import success
  const handleImportComplete = (result) => {
    showSuccess(`Successfully imported ${result.totalCount} players`);
  };
  
  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'teams':
        return <TeamForm onSuccess={handleTeamCreated} />;
      
      case 'players':
        return <PlayerImport onImportComplete={handleImportComplete} />;
      
      case 'auction':
        return <AuctionControls />;
      
      case 'dashboard':
      default:
        return <AdminDashboard onActionClick={handleDashboardAction} />;
    }
  };
  
  // Get title and description based on active tab
  const getTabInfo = () => {
    const tab = ADMIN_TABS.find(t => t.id === activeTab) || ADMIN_TABS[0];
    
    switch (tab.id) {
      case 'teams':
        return {
          title: 'Team Management',
          description: 'Create and manage teams participating in the auction'
        };
      
      case 'players':
        return {
          title: 'Player Import',
          description: 'Import players from CSV or Excel files'
        };
      
      case 'auction':
        return {
          title: 'Auction Controls',
          description: 'Manage the live auction process'
        };
      
      case 'dashboard':
      default:
        return {
          title: 'Admin Dashboard',
          description: 'Auction status and quick access to management tools'
        };
    }
  };
  
  const { title, description } = getTabInfo();
  
  return (
    <AdminLayout 
      activeTab={activeTab}
      onTabChange={handleTabChange}
      title={title}
      description={description}
    >
      {renderContent()}
    </AdminLayout>
  );
};

export default AdminPage;