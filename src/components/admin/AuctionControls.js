// src/components/admin/AuctionControls.js
import React, { useState, useEffect } from 'react';
import { 
  getAuctionSettings, 
  startPlayerAuction, 
  endPlayerAuction, 
  completePlayerSale, 
  initializeAuction
} from '../../services/auctionService';
import { getPlayersByStatus, markPlayerAsUnsold } from '../../services/playerService';
import Card from '../common/Card';
import Button from '../common/Button';
import PlayerCard from '../players/PlayerCard';

const AuctionControls = () => {
  const [auctionSettings, setAuctionSettings] = useState(null);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [unsoldPlayers, setUnsoldPlayers] = useState([]);
  const [currentRound, setCurrentRound] = useState('main'); // 'main' or 'unsold'
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Load auction settings and available players
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Initialize auction settings if needed
        let settings = await getAuctionSettings();
        if (!settings) {
          settings = await initializeAuction();
        }
        setAuctionSettings(settings);
        
        // Load available players
        const players = await getPlayersByStatus('available');
        setAvailablePlayers(players);
        
        // Load unsold players
        const unsold = await getPlayersByStatus('unsold');
        setUnsoldPlayers(unsold);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load auction data. Please try again.');
        setLoading(false);
        console.error(err);
      }
    };
    
    fetchData();
  }, []);

  // Start auction for a player
  const handleStartAuction = async () => {
    if (!selectedPlayer) {
      setError('Please select a player first');
      return;
    }
    
    try {
      setActionLoading(true);
      await startPlayerAuction(selectedPlayer.id);
      setMessage(`Auction started for ${selectedPlayer.name}`);
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (err) {
      setError('Failed to start auction. Please try again.');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // Mark player as sold and complete the sale
  const handleCompleteSale = async () => {
    if (!selectedPlayer) {
      setError('Please select a player first');
      return;
    }
    
    try {
      setActionLoading(true);
      const result = await completePlayerSale(selectedPlayer.id);
      
      // Update available players list
      setAvailablePlayers(availablePlayers.filter(p => p.id !== selectedPlayer.id));
      
      // Refresh player selection
      setSelectedPlayer(null);
      
      setMessage(`Player sold to Team ${result.teamId} for $${result.amount.toLocaleString()}`);
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (err) {
      setError('Failed to complete sale. Please check if there are any bids.');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // Mark player as unsold
  const handleMarkUnsold = async () => {
    if (!selectedPlayer) {
      setError('Please select a player first');
      return;
    }
    
    try {
      setActionLoading(true);
      await markPlayerAsUnsold(selectedPlayer.id);
      
      // End current auction
      await endPlayerAuction();
      
      // Update available players list
      setAvailablePlayers(availablePlayers.filter(p => p.id !== selectedPlayer.id));
      
      // Add to unsold players list
      setUnsoldPlayers([...unsoldPlayers, { ...selectedPlayer, status: 'unsold' }]);
      
      // Refresh player selection
      setSelectedPlayer(null);
      
      setMessage(`${selectedPlayer.name} marked as unsold`);
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (err) {
      setError('Failed to mark player as unsold. Please try again.');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // Switch to unsold players round
  const handleStartUnsoldRound = () => {
    setCurrentRound('unsold');
    setSelectedPlayer(null);
    setMessage('Now auctioning unsold players with reduced base price');
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage(null);
    }, 3000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-2">Auction Control Panel</h2>
        <p className="text-blue-100">
          {currentRound === 'main' 
            ? 'Main Round: Players are auctioned at their base price' 
            : 'Unsold Round: Players are auctioned at reduced base price'}
        </p>
      </div>
      
      {/* Messages and Errors */}
      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md">
          <p>{message}</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
          <p>{error}</p>
          <button 
            className="text-red-700 font-medium underline mt-1"
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      )}
      
      {/* Auction Controls and Current Player */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Player Selection */}
        <div className="lg:col-span-2">
          <Card title="Select Player for Auction">
            {currentRound === 'main' && availablePlayers.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-gray-500 mb-4">No more available players in the main round.</p>
                {unsoldPlayers.length > 0 && (
                  <Button variant="primary" onClick={handleStartUnsoldRound}>
                    Start Unsold Players Round
                  </Button>
                )}
              </div>
            )}
            
            {currentRound === 'unsold' && unsoldPlayers.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-gray-500">No unsold players to auction.</p>
              </div>
            )}
            
            {currentRound === 'main' && availablePlayers.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto p-2">
                {availablePlayers.map(player => (
                  <div 
                    key={player.id} 
                    className={`cursor-pointer ${selectedPlayer?.id === player.id ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => setSelectedPlayer(player)}
                  >
                    <PlayerCard player={player} />
                  </div>
                ))}
              </div>
            )}
            
            {currentRound === 'unsold' && unsoldPlayers.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto p-2">
                {unsoldPlayers.map(player => (
                  <div 
                    key={player.id} 
                    className={`cursor-pointer ${selectedPlayer?.id === player.id ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => setSelectedPlayer(player)}
                  >
                    <PlayerCard 
                      player={{
                        ...player,
                        basePrice: Math.floor(player.basePrice * 0.5) // 50% reduced price for unsold players
                      }} 
                    />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
        
        {/* Auction Actions */}
        <div>
          <Card title="Auction Actions">
            {selectedPlayer ? (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-gray-700 font-medium">Selected Player:</p>
                  <p className="text-xl font-bold text-gray-900">{selectedPlayer.name}</p>
                  <p className="text-gray-700">
                    Base Price: ${currentRound === 'unsold' 
                      ? Math.floor(selectedPlayer.basePrice * 0.5).toLocaleString()
                      : selectedPlayer.basePrice.toLocaleString()}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Button
                    variant="primary"
                    onClick={handleStartAuction}
                    disabled={actionLoading}
                    fullWidth
                  >
                    Start Auction for This Player
                  </Button>
                  
                  <Button
                    variant="success"
                    onClick={handleCompleteSale}
                    disabled={actionLoading}
                    fullWidth
                  >
                    Complete Sale (Sold)
                  </Button>
                  
                  <Button
                    variant="warning"
                    onClick={handleMarkUnsold}
                    disabled={actionLoading}
                    fullWidth
                  >
                    No Bids (Unsold)
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-gray-500">Select a player to start auction</p>
              </div>
            )}
            
            {/* Round Controls */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Current Round:</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {currentRound === 'main' ? 'Main Round' : 'Unsold Players Round'}
                </span>
              </div>
              
              {currentRound === 'main' && unsoldPlayers.length > 0 && (
                <div className="mt-4">
                  <Button
                    variant="secondary"
                    onClick={handleStartUnsoldRound}
                    fullWidth
                  >
                    Switch to Unsold Players Round
                  </Button>
                </div>
              )}
              
              {currentRound === 'unsold' && (
                <div className="mt-4">
                  <Button
                    variant="secondary"
                    onClick={() => setCurrentRound('main')}
                    fullWidth
                  >
                    Switch to Main Round
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
      
      {/* Auction Statistics */}
      <Card title="Auction Statistics">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-md text-center">
            <p className="text-sm text-blue-600 font-medium">Available Players</p>
            <p className="text-3xl font-bold text-blue-700">{availablePlayers.length}</p>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-md text-center">
            <p className="text-sm text-yellow-600 font-medium">Unsold Players</p>
            <p className="text-3xl font-bold text-yellow-700">{unsoldPlayers.length}</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-md text-center">
            <p className="text-sm text-green-600 font-medium">Current Min Bid Increment</p>
            <p className="text-3xl font-bold text-green-700">
              ${auctionSettings?.minBidIncrement.toLocaleString() || '100'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AuctionControls;