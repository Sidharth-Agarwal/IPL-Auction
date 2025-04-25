// src/pages/AdminPage.js
import React, { useState } from 'react';
import Header from '../components/common/Header';
import TeamForm from '../components/admin/TeamForm';
import PlayerImport from '../components/admin/PlayerImport';
import AuctionControls from '../components/admin/AuctionControls';
import Button from '../components/common/Button';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('teams');
  
  // Tabs configuration
  const tabs = [
    { id: 'teams', label: 'Team Management' },
    { id: 'players', label: 'Player Import' },
    { id: 'auction', label: 'Auction Controls' }
  ];
  
  return (
    <div>
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-6">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-blue-100">
              Manage teams, import players, and control the auction process
            </p>
          </div>
          
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    py-4 px-6 text-center border-b-2 font-medium text-sm
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
        
        {/* Tab Content */}
        <div className="mb-10">
          {activeTab === 'teams' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Team Management</h2>
              <TeamForm onTeamCreated={() => {
                // Optionally handle team creation event
              }} />
            </div>
          )}
          
          {activeTab === 'players' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Player Import</h2>
              <PlayerImport onImportComplete={() => {
                // Optionally handle import completion
              }} />
            </div>
          )}
          
          {activeTab === 'auction' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Auction Controls</h2>
              <AuctionControls />
            </div>
          )}
        </div>
        
        {/* Quick Actions */}
        <div className="bg-gray-50 rounded-lg p-6 shadow-md">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="primary"
              onClick={() => setActiveTab('teams')}
            >
              Add New Team
            </Button>
            
            <Button 
              variant="secondary"
              onClick={() => setActiveTab('players')}
            >
              Import Players
            </Button>
            
            <Button 
              variant="success"
              onClick={() => setActiveTab('auction')}
            >
              Start Auction
            </Button>
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-800 text-white mt-12 py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} Cricket Auction App. All rights reserved.</p>
          <p className="text-gray-400 text-sm mt-2">
            Admin Dashboard
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AdminPage;