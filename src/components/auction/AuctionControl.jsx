// src/components/auction/AuctionControl.jsx
import React, { useState, useEffect } from 'react';
import { 
  getAvailablePlayers, 
  updatePlayerStatus 
} from '../../services/playerService';
import { 
  getAllTeams, 
  getTeam 
} from '../../services/teamService';
import {
  completePlayerSale,
  markPlayerAsUnsold
} from '../../services/auctionService';
import Card from '../common/Card';
import Button from '../common/Button';
import PlayerDisplay from './PlayerDisplay';
import BidControl from './BidControl';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';

const AuctionControl = () => {
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [isAuctionActive, setIsAuctionActive] = useState(false);
  const [bidAmount, setBidAmount] = useState(0);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Load available players and teams on initial render
  useEffect(() => {
    fetchInitialData();
  }, []);
  
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load available players
      const players = await getAvailablePlayers();
      setAvailablePlayers(players);
      
      // Load teams
      const teamsData = await getAllTeams();
      setTeams(teamsData);
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading auction data:', err);
      setError('Failed to load auction data. Please try again.');
      setLoading(false);
    }
  };
  
  // Refresh team data to get updated wallet amounts
  const refreshTeamData = async () => {
    try {
      const teamsData = await getAllTeams();
      setTeams(teamsData);
    } catch (err) {
      console.error('Error refreshing team data:', err);
    }
  };
  
  const startAuction = () => {
    if (availablePlayers.length === 0) {
      setError('No available players to auction');
      return;
    }
    
    // Select the first available player
    setCurrentPlayer(availablePlayers[0]);
    setBidAmount(availablePlayers[0].basePrice || 1000);
    setSelectedTeamId('');
    setIsAuctionActive(true);
  };
  
  const handleBidAmountChange = (amount) => {
    setBidAmount(amount);
  };
  
  const handleTeamSelect = (teamId) => {
    setSelectedTeamId(teamId);
  };
  
  const handleSoldClick = async () => {
    if (!currentPlayer) return;
    if (!selectedTeamId) {
      setError('Please select a team');
      return;
    }
    
    try {
      setActionLoading(true);
      setError(null);
      
      // Complete the sale - this will update both player and team
      await completePlayerSale(currentPlayer.id, selectedTeamId, bidAmount);
      
      // Show success message
      const team = teams.find(t => t.id === selectedTeamId);
      const teamName = team ? team.name : 'Selected team';
      
      setSuccessMessage(`${currentPlayer.name} sold to ${teamName} for $${bidAmount.toLocaleString()}`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
      // Remove the sold player from available players
      setAvailablePlayers(prev => prev.filter(p => p.id !== currentPlayer.id));
      
      // Refresh team data to get updated wallet
      await refreshTeamData();
      
      // Check if there are more players
      if (availablePlayers.length <= 1) {
        // No more players
        setCurrentPlayer(null);
        setIsAuctionActive(false);
        setActionLoading(false);
        return;
      }
      
      // Move to the next player
      const nextPlayer = availablePlayers.find(p => p.id !== currentPlayer.id);
      setCurrentPlayer(nextPlayer);
      setBidAmount(nextPlayer.basePrice || 1000);
      setSelectedTeamId('');
      
      setActionLoading(false);
    } catch (err) {
      console.error('Error marking player as sold:', err);
      setError(err.message || 'Failed to complete sale. Please try again.');
      setActionLoading(false);
    }
  };
  
  const handleUnsoldClick = async () => {
    if (!currentPlayer) return;
    
    try {
      setActionLoading(true);
      setError(null);
      
      // Update player status to 'unsold'
      await markPlayerAsUnsold(currentPlayer.id);
      
      // Remove the unsold player from available players
      setAvailablePlayers(prev => prev.filter(p => p.id !== currentPlayer.id));
      
      // Check if there are more players
      if (availablePlayers.length <= 1) {
        // No more players
        setCurrentPlayer(null);
        setIsAuctionActive(false);
        setActionLoading(false);
        return;
      }
      
      // Move to the next player
      const nextPlayer = availablePlayers.find(p => p.id !== currentPlayer.id);
      setCurrentPlayer(nextPlayer);
      setBidAmount(nextPlayer.basePrice || 1000);
      setSelectedTeamId('');
      
      setActionLoading(false);
    } catch (err) {
      console.error('Error marking player as unsold:', err);
      setError('Failed to mark as unsold. Please try again.');
      setActionLoading(false);
    }
  };
  
  const handleSkipClick = () => {
    if (!currentPlayer || availablePlayers.length <= 1) return;
    
    // Find the next player (excluding current)
    const currentIndex = availablePlayers.findIndex(p => p.id === currentPlayer.id);
    const nextIndex = (currentIndex + 1) % availablePlayers.length;
    
    // Set the next player
    setCurrentPlayer(availablePlayers[nextIndex]);
    setBidAmount(availablePlayers[nextIndex].basePrice || 1000);
    setSelectedTeamId('');
  };

  // Helper function to render player image
  const renderPlayerImage = (player, imgClass = "h-12 w-12 rounded-full object-cover border border-gray-200") => {
    return player.imageUrl ? (
      <img 
        src={player.imageUrl} 
        alt={player.name} 
        className={imgClass}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = 'data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3e%3crect x="3" y="3" width="18" height="18" rx="2" ry="2"%3e%3c/rect%3e%3ccircle cx="8.5" cy="8.5" r="1.5"%3e%3c/circle%3e%3cpolyline points="21 15 16 10 5 21"%3e%3c/polyline%3e%3c/svg%3e';
        }}
      />
    ) : (
      <div className={imgClass.replace("object-cover", "") + " bg-blue-100 flex items-center justify-center"}>
        <span className="text-lg font-bold text-blue-700">
          {player.name.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  };

  // Helper function to render team logo
  const renderTeamLogo = (team, imgClass = "h-8 w-8 rounded-full mr-3") => {
    return team.logoUrl ? (
      <img 
        src={team.logoUrl} 
        alt={team.name} 
        className={imgClass}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = 'data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3e%3crect x="3" y="3" width="18" height="18" rx="2" ry="2"%3e%3c/rect%3e%3ccircle cx="8.5" cy="8.5" r="1.5"%3e%3c/circle%3e%3cpolyline points="21 15 16 10 5 21"%3e%3c/polyline%3e%3c/svg%3e';
        }}
      />
    ) : (
      <div className={imgClass.replace("mr-3", "") + " bg-blue-100 flex items-center justify-center"}>
        <span className="text-sm font-bold text-blue-700">
          {team.name.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  };
  
  if (loading) {
    return <Loading text="Loading auction data..." />;
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
      
      {/* Auction Controls */}
      <Card title="Auction Controls">
        <div className="p-4">
          {!isAuctionActive ? (
            <div className="text-center py-8">
              {availablePlayers.length === 0 ? (
                <div>
                  <p className="text-gray-500 mb-4">No available players to auction.</p>
                  <Button 
                    variant="primary" 
                    onClick={fetchInitialData}
                  >
                    Refresh Data
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="text-gray-500 mb-4">
                    {availablePlayers.length} players available for auction
                  </p>
                  <Button 
                    variant="primary" 
                    onClick={startAuction}
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    }
                  >
                    Start Auction
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Current Player */}
              <div className="bg-blue-50 p-4 rounded-lg flex justify-between items-center">
                <div>
                  <p className="text-sm text-blue-600">Current Player</p>
                  <p className="text-xl font-bold">{currentPlayer?.name}</p>
                  <p className="text-blue-600">{currentPlayer?.role || 'Player'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-600">Base Price</p>
                  <p className="text-xl font-bold">${currentPlayer?.basePrice?.toLocaleString() || '1,000'}</p>
                </div>
              </div>
              
              {/* Bidding Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <BidControl 
                  bidAmount={bidAmount}
                  onBidAmountChange={handleBidAmountChange}
                  teams={teams}
                  selectedTeamId={selectedTeamId}
                  onTeamSelect={handleTeamSelect}
                />
                
                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button 
                    variant="success" 
                    onClick={handleSoldClick} 
                    disabled={!selectedTeamId || actionLoading}
                    loading={actionLoading && selectedTeamId}
                    loadingText="Processing..."
                    fullWidth
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    }
                  >
                    Sold
                  </Button>
                  
                  <Button 
                    variant="danger" 
                    onClick={handleUnsoldClick}
                    disabled={actionLoading}
                    loading={actionLoading && !selectedTeamId}
                    loadingText="Processing..."
                    fullWidth
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    }
                  >
                    Unsold
                  </Button>
                  
                  <Button 
                    variant="secondary" 
                    onClick={handleSkipClick}
                    disabled={actionLoading || availablePlayers.length <= 1}
                    fullWidth
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    }
                  >
                    Skip to Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
      
      {/* Player Display */}
      {currentPlayer && (
        <PlayerDisplay player={currentPlayer} />
      )}
      
      {/* Players Queue */}
      {isAuctionActive && availablePlayers.length > 1 && (
        <Card title="Players Queue">
          <div className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {availablePlayers
                .filter(p => p.id !== currentPlayer?.id)
                .slice(0, 6)
                .map(player => (
                  <div 
                    key={player.id} 
                    className="bg-gray-50 p-2 rounded-lg border border-gray-200 text-center cursor-pointer hover:bg-blue-50"
                    onClick={() => {
                      setCurrentPlayer(player);
                      setBidAmount(player.basePrice || 1000);
                      setSelectedTeamId('');
                    }}
                  >
                    <div className="flex justify-center mb-2">
                      {renderPlayerImage(player)}
                    </div>
                    <p className="text-sm font-medium truncate">{player.name}</p>
                    <p className="text-xs text-gray-500">${player.basePrice?.toLocaleString() || '1,000'}</p>
                  </div>
                ))}
            </div>
            
            <div className="mt-3 text-right">
              <p className="text-sm text-gray-500">
                {availablePlayers.length - 1} more player{availablePlayers.length - 1 !== 1 ? 's' : ''} available
              </p>
            </div>
          </div>
        </Card>
      )}
      
      {/* Team Wallet Information */}
      {isAuctionActive && teams.length > 0 && (
        <Card title="Team Wallet Status">
          <div className="p-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Available Funds</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Players</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teams.map(team => (
                  <tr key={team.id} className={selectedTeamId === team.id ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {renderTeamLogo(team)}
                        <div className="text-sm font-medium text-gray-900">{team.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <span className={`font-medium ${
                        selectedTeamId === team.id && bidAmount > team.wallet 
                          ? 'text-red-600' 
                          : 'text-green-600'
                      }`}>
                        ${team.wallet?.toLocaleString() || '0'}
                      </span>
                      {selectedTeamId === team.id && (
                        <span className="ml-2 text-xs text-gray-500">
                          (After bid: ${(team.wallet - bidAmount).toLocaleString()})
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      {team.players?.length || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AuctionControl;