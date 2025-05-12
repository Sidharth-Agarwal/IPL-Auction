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
import BidControl from './BidControl';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';
import { formatIndianRupee } from '../../utils/currencyUtils';

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
      
      setSuccessMessage(`${currentPlayer.name} sold to ${teamName} for ${formatIndianRupee(bidAmount)}`);
      
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
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Main Auction Area - Left Side (2/3 width on large screens) */}
      <div className="w-full lg:w-2/3 space-y-4">
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
        
        {/* Merged Auction Controls and Player Details */}
        <Card title="Auction Controls">
          <div className="p-3">
            {!isAuctionActive ? (
              <div className="text-center py-6">
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
              <div className="space-y-4">
                {/* Top section with Player Image, Name, and Basic Info */}
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Left: Player Image and Badges */}
                  <div className="md:w-1/3 flex flex-col items-center">
                    {/* Player Image */}
                    {currentPlayer.imageUrl ? (
                      <img 
                        src={currentPlayer.imageUrl} 
                        alt={currentPlayer.name} 
                        className="w-32 h-32 rounded-lg object-cover mb-2 border border-gray-200"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3e%3crect x="3" y="3" width="18" height="18" rx="2" ry="2"%3e%3c/rect%3e%3ccircle cx="8.5" cy="8.5" r="1.5"%3e%3c/circle%3e%3cpolyline points="21 15 16 10 5 21"%3e%3c/polyline%3e%3c/svg%3e';
                        }}
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-lg bg-blue-100 flex items-center justify-center mb-2 border border-blue-200">
                        <span className="text-5xl font-bold text-blue-700">
                          {currentPlayer.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    
                    {/* Player Badges */}
                    <div className="text-center mb-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {currentPlayer.playerType || 'Player'}
                      </span>
                      {currentPlayer.isCapped && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-1">
                          {currentPlayer.isCapped === 'capped' ? 'Capped' : 'Uncapped'}
                        </span>
                      )}
                      
                      {/* Gender Badge */}
                      {currentPlayer.gender && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ml-1 ${
                          currentPlayer.gender === 'female' ? 'bg-pink-100 text-pink-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {currentPlayer.gender === 'female' ? 'Female' : 'Male'}
                        </span>
                      )}
                    </div>
                    
                    {/* Base Price */}
                    <div className="bg-gray-50 px-3 py-2 rounded-lg w-full text-center">
                      <p className="text-xs text-gray-500">Base Price</p>
                      <p className="text-lg font-bold text-green-600">{formatIndianRupee(currentPlayer.basePrice || 1000)}</p>
                    </div>
                  </div>
                  
                  {/* Right: Player Details and Stats */}
                  <div className="md:w-2/3">
                    <h2 className="text-lg font-bold text-gray-900 mb-2">{currentPlayer.name}</h2>
                    
                    {/* Player Attributes in compact grid */}
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      {currentPlayer.specialization && (
                        <div>
                          <span className="text-xs text-gray-500">Specialization:</span>
                          <p className="text-sm font-medium">{currentPlayer.specialization}</p>
                        </div>
                      )}
                      
                      {currentPlayer.battingStyle && (
                        <div>
                          <span className="text-xs text-gray-500">Batting Style:</span>
                          <p className="text-sm font-medium">{currentPlayer.battingStyle}</p>
                        </div>
                      )}
                      
                      {currentPlayer.ballingType && (
                        <div>
                          <span className="text-xs text-gray-500">Bowling Type:</span>
                          <p className="text-sm font-medium">{currentPlayer.ballingType}</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Player Statistics in compact grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Batting Stats */}
                      <div>
                        <h4 className="text-xs font-medium text-blue-600 mb-1">Batting</h4>
                        <div className="grid grid-cols-2 gap-1 text-center">
                          <div className="bg-blue-50 p-1 rounded">
                            <p className="text-xs text-gray-500">Innings</p>
                            <p className="text-sm font-bold">{currentPlayer.battingInnings || 0}</p>
                          </div>
                          <div className="bg-blue-50 p-1 rounded">
                            <p className="text-xs text-gray-500">Runs</p>
                            <p className="text-sm font-bold">{currentPlayer.runs || 0}</p>
                          </div>
                          <div className="bg-blue-50 p-1 rounded">
                            <p className="text-xs text-gray-500">Average</p>
                            <p className="text-sm font-bold">{currentPlayer.battingAverage?.toFixed(2) || '0.00'}</p>
                          </div>
                          <div className="bg-blue-50 p-1 rounded">
                            <p className="text-xs text-gray-500">SR</p>
                            <p className="text-sm font-bold">{currentPlayer.strikeRate?.toFixed(2) || '0.00'}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Bowling Stats */}
                      <div>
                        <h4 className="text-xs font-medium text-green-600 mb-1">Bowling</h4>
                        <div className="grid grid-cols-2 gap-1 text-center">
                          <div className="bg-green-50 p-1 rounded">
                            <p className="text-xs text-gray-500">Innings</p>
                            <p className="text-sm font-bold">{currentPlayer.ballingInnings || 0}</p>
                          </div>
                          <div className="bg-green-50 p-1 rounded">
                            <p className="text-xs text-gray-500">Wickets</p>
                            <p className="text-sm font-bold">{currentPlayer.wickets || 0}</p>
                          </div>
                          <div className="bg-green-50 p-1 rounded">
                            <p className="text-xs text-gray-500">Average</p>
                            <p className="text-sm font-bold">{currentPlayer.ballingAverage?.toFixed(2) || '0.00'}</p>
                          </div>
                          <div className="bg-green-50 p-1 rounded">
                            <p className="text-xs text-gray-500">Economy</p>
                            <p className="text-sm font-bold">{currentPlayer.economy?.toFixed(2) || '0.00'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Bidding Controls - Below Player Info */}
                <div className="border-t pt-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <BidControl 
                      bidAmount={bidAmount}
                      onBidAmountChange={handleBidAmountChange}
                      teams={teams}
                      selectedTeamId={selectedTeamId}
                      onTeamSelect={handleTeamSelect}
                    />
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col justify-between">
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <Button 
                          variant="success" 
                          onClick={handleSoldClick} 
                          disabled={!selectedTeamId || actionLoading}
                          loading={actionLoading && selectedTeamId}
                          loadingText="Processing..."
                          size="sm"
                          icon={
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
                          size="sm"
                          icon={
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          }
                        >
                          Unsold
                        </Button>
                      </div>
                      
                      <Button 
                        variant="secondary" 
                        onClick={handleSkipClick}
                        disabled={actionLoading || availablePlayers.length <= 1}
                        size="sm"
                        fullWidth
                        icon={
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        }
                      >
                        Skip to Next
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
        
        {/* Players Queue - More Compact */}
        {isAuctionActive && availablePlayers.length > 1 && (
          <Card title="Players Queue">
            <div className="p-3">
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
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
                      <div className="flex justify-center mb-1">
                        {renderPlayerImage(player, "h-8 w-8 rounded-full")}
                      </div>
                      <p className="text-xs font-medium truncate">{player.name}</p>
                      <p className="text-xs text-gray-500">{formatIndianRupee(player.basePrice || 1000)}</p>
                    </div>
                  ))}
              </div>
              
              <div className="mt-2 text-right">
                <p className="text-xs text-gray-500">
                  {availablePlayers.length - 1} more player{availablePlayers.length - 1 !== 1 ? 's' : ''} available
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
      
      {/* Team Wallet Status Sidebar - Right Side (1/3 width on large screens) */}
      <div className="w-full lg:w-1/3">
        {/* Team Wallet Information */}
        {isAuctionActive && teams.length > 0 && (
          <Card title="Team Wallet Status">
            <div className="p-3 space-y-3">
              {teams.map(team => (
                <div 
                  key={team.id} 
                  className={`${
                    selectedTeamId === team.id ? 'bg-blue-50 border-blue-200' : 'bg-white hover:bg-gray-50'
                  } border rounded-lg p-2 transition-colors cursor-pointer`}
                  onClick={() => handleTeamSelect(team.id)}
                >
                  <div className="flex items-center">
                    {renderTeamLogo(team, "h-6 w-6 rounded-full mr-2")}
                    <div>
                      <div className="text-sm font-medium text-gray-900">{team.name}</div>
                      <div className="text-xs text-gray-500 truncate max-w-xs">
                        {[team.owner1, team.owner2, team.owner3].filter(Boolean).join(', ')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-1 grid grid-cols-3 gap-1 text-xs">
                    <div>
                      <span className="text-gray-500">Funds:</span>
                      <div className={`font-medium ${
                        selectedTeamId === team.id && bidAmount > team.wallet 
                          ? 'text-red-600' 
                          : 'text-green-600'
                      }`}>
                        {formatIndianRupee(team.wallet || 0)}
                      </div>
                    </div>
                    
                    {selectedTeamId === team.id && (
                      <div>
                        <span className="text-gray-500">After Bid:</span>
                        <div className="font-medium text-blue-600">
                          {formatIndianRupee(team.wallet - bidAmount)}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <span className="text-gray-500">Players:</span>
                      <div className="font-medium">{team.players?.length || 0}</div>
                    </div>
                  </div>
                  
                  {/* Team Leadership - More compact */}
                  {(team.captain || team.womanCaptain) && (
                    <div className="mt-1 pt-1 border-t border-gray-100 text-xs">
                      {team.captain && (
                        <span className="inline-block mr-2">
                          <span className="text-blue-600 font-medium">C:</span> {team.captain}
                        </span>
                      )}
                      {team.womanCaptain && (
                        <span className="inline-block">
                          <span className="text-pink-600 font-medium">WC:</span> {team.womanCaptain}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Selection indicator for current team */}
                  {selectedTeamId === team.id && (
                    <div className="mt-1 pt-1 border-t border-blue-100 flex justify-between items-center">
                      <span className="text-xs font-medium text-blue-600">Selected for Bidding</span>
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AuctionControl;