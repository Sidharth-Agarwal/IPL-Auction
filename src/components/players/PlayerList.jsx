// src/components/players/PlayerList.jsx
import React, { useState, useEffect } from 'react';
import { getAllPlayers } from '../../services/playerService';
import Card from '../common/Card';
import Button from '../common/Button';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';
import Modal from '../common/Modal';
import PlayerImport from './PlayerImport';
import PlayerForm from './PlayerForm';
import PlayerModal from './PlayerModal'; // Import the PlayerModal component
import { formatIndianRupee } from '../../utils/currencyUtils';

const PlayerList = () => {
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [showPlayerFormModal, setShowPlayerFormModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Add state for player details modal
  const [showPlayerDetailModal, setShowPlayerDetailModal] = useState(false);
  const [playerToView, setPlayerToView] = useState(null);
  
  // Load players on initial render
  useEffect(() => {
    fetchPlayers();
  }, []);
  
  // Filter players when search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPlayers(players);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = players.filter(
        player => 
          player.name.toLowerCase().includes(term) || 
          (player.playerType && player.playerType.toLowerCase().includes(term)) ||
          (player.specialization && player.specialization.toLowerCase().includes(term)) ||
          (player.battingStyle && player.battingStyle.toLowerCase().includes(term)) ||
          (player.ballingType && player.ballingType.toLowerCase().includes(term)) ||
          (player.gender && player.gender.toLowerCase().includes(term))
      );
      setFilteredPlayers(filtered);
    }
  }, [players, searchTerm]);
  
  const fetchPlayers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const playersData = await getAllPlayers();
      
      // Log the capped/uncapped status for debugging
      console.log('Player data:', playersData.map(p => ({ 
        name: p.name, 
        isCapped: p.isCapped 
      })));
      
      setPlayers(playersData);
      setFilteredPlayers(playersData);
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading players:', err);
      setError('Failed to load players. Please try again.');
      setLoading(false);
    }
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleImportClick = () => {
    setShowImportModal(true);
  };
  
  const handleAddPlayer = () => {
    setSelectedPlayer(null);
    setShowPlayerFormModal(true);
  };
  
  const handleEditPlayer = (player) => {
    setSelectedPlayer(player);
    setShowPlayerFormModal(true);
  };
  
  // Handler for viewing player details
  const handleViewPlayer = (player) => {
    setPlayerToView(player);
    setShowPlayerDetailModal(true);
  };
  
  const handleImportComplete = (result) => {
    setShowImportModal(false);
    setSuccessMessage(result.message);
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
    
    // Refresh players list
    fetchPlayers();
  };
  
  const handlePlayerFormSuccess = (message) => {
    setShowPlayerFormModal(false);
    setSelectedPlayer(null);
    setSuccessMessage(message);
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
    
    // Refresh players list
    fetchPlayers();
  };
  
  if (loading) {
    return <Loading text="Loading players..." />;
  }
  
  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{successMessage}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setSuccessMessage('')}>
            <svg className="fill-current h-6 w-6 text-green-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <title>Close</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
            </svg>
          </span>
        </div>
      )}
      
      {/* Error Display */}
      {error && (
        <ErrorMessage message={error} onDismiss={() => setError(null)} />
      )}
      
      {/* Header with Search and Import Button */}
      <div className="flex flex-col md:flex-row justify-between gap-4 bg-white p-4 rounded-lg shadow">
        <div className="flex-grow">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search Players
          </label>
          <div className="mt-2 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              id="search"
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Search by name, type, specialization..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>
        <div className="flex items-end space-x-2">
          <Button 
            variant="primary" 
            size="header"
            onClick={handleAddPlayer}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            }
          >
            Add Player
          </Button>
          <Button 
            variant="secondary" 
            size="header"
            onClick={handleImportClick}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
              </svg>
            }
          >
            Import Players
          </Button>
        </div>
      </div>
      
      {/* Players Table */}
      <Card title={`Players (${players.length})`}>
        {filteredPlayers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No players found. Import players to get started!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Player
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gender
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Specialization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Batting
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bowling
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Base Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPlayers.map(player => (
                  <tr 
                    key={player.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleViewPlayer(player)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {player.imageUrl ? (
                          <img 
                            src={player.imageUrl} 
                            alt={player.name} 
                            className="w-12 h-12 rounded-full object-cover border hover:w-24 hover:h-24 transition-all cursor-pointer mr-3"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent row click handler
                              if (player.imageUrl) {
                                window.open(player.imageUrl, '_blank');
                              }
                            }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3e%3crect x="3" y="3" width="18" height="18" rx="2" ry="2"%3e%3c/rect%3e%3ccircle cx="8.5" cy="8.5" r="1.5"%3e%3c/circle%3e%3cpolyline points="21 15 16 10 5 21"%3e%3c/polyline%3e%3c/svg%3e';
                            }}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                            <span className="text-lg font-bold text-blue-700">
                              {player.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="ml-3 text-sm font-medium text-gray-900">{player.name}</div>
                          <div className="ml-3 text-xs text-gray-500">
                            {player.isCapped === 'capped' ? (
                              <span className="px-1.5 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">Capped</span>
                            ) : (
                              <span className="px-1.5 py-0.5 bg-gray-100 text-gray-800 rounded-full text-xs">Uncapped</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 capitalize">
                        {player.gender === 'female' ? (
                          <span className="px-1.5 py-0.5 bg-pink-100 text-pink-800 rounded-full text-xs capitalize">
                            {player.gender || 'Male'}
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs capitalize">
                            {player.gender || 'Male'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{player.playerType || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{player.specialization || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs text-gray-500">
                        <div>{player.battingStyle || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs text-gray-500">
                        <div>{player.ballingType || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-green-600">{formatIndianRupee(player.basePrice || 0)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${player.status === 'sold' ? 'bg-green-100 text-green-800' : 
                         player.status === 'unsold' ? 'bg-red-100 text-red-800' : 
                         'bg-blue-100 text-blue-800'}`}>
                        {player.status || 'available'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {player.status === 'sold' ? (player.soldToTeam || '-') : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button 
                        variant="outline" 
                        size="xs" 
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click handler
                          handleEditPlayer(player);
                        }}
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      
      {/* Import Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Import Players"
        size="lg"
      >
        <PlayerImport 
          onImportComplete={handleImportComplete}
        />
      </Modal>
      
      {/* Add/Edit Player Modal */}
      <Modal
        isOpen={showPlayerFormModal}
        onClose={() => {
          setShowPlayerFormModal(false);
          setSelectedPlayer(null);
        }}
        title={selectedPlayer ? "Edit Player" : "Add Player"}
        size="lg"
      >
        <PlayerForm 
          playerId={selectedPlayer?.id} 
          onSuccess={handlePlayerFormSuccess}
          onCancel={() => {
            setShowPlayerFormModal(false);
            setSelectedPlayer(null);
          }}
        />
      </Modal>
      
      {/* Player Details Modal */}
      <PlayerModal 
        player={playerToView} 
        isOpen={showPlayerDetailModal} 
        onClose={() => {
          setShowPlayerDetailModal(false);
          setPlayerToView(null);
        }}
      />
    </div>
  );
};

export default PlayerList;