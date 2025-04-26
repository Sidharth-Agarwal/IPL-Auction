import React, { useState, useEffect } from 'react';
import PlayerImportForm from '../components/players/PlayerImportForm';
import PlayerList from '../components/players/PlayerList';

const PlayersPage = () => {
  const [activeTab, setActiveTab] = useState('list');

  // Tab navigation
  const tabs = [
    { id: 'list', label: 'Player List' },
    { id: 'import', label: 'Import Players' }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Players Management
      </h1>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'list' && <PlayerList />}
        {activeTab === 'import' && <PlayerImportForm />}
      </div>
    </div>
  );
};

export default PlayersPage;