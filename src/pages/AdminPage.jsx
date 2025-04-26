// src/pages/AdminPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import AdminDashboard from '../components/admin/AdminDashboard';
import TeamForm from '../components/admin/TeamForm';
import PlayerImport from '../components/admin/PlayerImport';
import AllPlayersView from '../components/admin/AllPlayersView'
import AuctionControls from '../components/admin/AuctionControls';
import { useNotification } from '../context/NotificationContext';

// Import ADMIN_TABS directly (not the default export)
const ADMIN_TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'teams', label: 'Team Management' },
  { id: 'players', label: 'Player Import' },
  { id: 'playersList', label: 'Players List' },
  { id: 'auction', label: 'Auction Controls' },
  { id: 'settings', label: 'Settings' }
];

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
    // Navigate to the player list view after successful import
    handleTabChange('playersList');
  };
  
  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'teams':
        return <TeamForm onSuccess={handleTeamCreated} />;
      
      case 'players':
        return <PlayerImport onImportComplete={handleImportComplete} />;
      
      case 'playersList':
        return <AllPlayersView />;
      
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
      
      case 'playersList':
        return {
          title: 'Players List',
          description: 'View and manage all imported players'
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