// src/components/admin/AuctionControls.jsx
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
import ErrorMessage from '../common/ErrorMessage';
import Loading from '../common/Loading';
import Modal from '../common/Modal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { PLAYER_STATUS, AUCTION_ROUNDS, DEFAULT_SETTINGS } from '../../utils/constants';
import { useNotification } from '../../context/NotificationContext';

const AuctionControls = () => {
  // State
  const [auctionSettings, setAuctionSettings] = useState(null);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [unsoldPlayers, setUnsoldPlayers] = useState([]);
  const [currentRound, setCurrentRound] = useState(AUCTION_ROUNDS.MAIN);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [auctionDate, setAuctionDate] = useState(DEFAULT_SETTINGS.DEFAULT_AUCTION_DATE);
  
  const { showSuccess, showError, showInfo } = useNotification();

  // Load auction settings and available players
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Initialize auction settings if needed
        let settings = await getAuctionSettings().catch(() => null);
        
        if (!settings) {
          settings = await initializeAuction({
            auctionDate: DEFAULT_SETTINGS.DEFAULT_AUCTION_DATE,
            minBidIncrement: DEFAULT_SETTINGS.MIN_BID_INCREMENT,
            unsoldPriceReduction: DEFAULT_SETTINGS.UNSOLD_PRICE_REDUCTION
          });
        }
        
        setAuctionSettings(settings);
        setAuctionDate(settings.auctionDate || DEFAULT_SETTINGS.DEFAULT_AUCTION_DATE);
        
        // Load available players
        const players = await getPlayersByStatus(PLAYER_STATUS.AVAILABLE);
        setAvailablePlayers(players);
        
        // Load unsold players
        const unsold = await getPlayersByStatus(PLAYER_STATUS.UNSOLD);
        setUnsoldPlayers(unsold);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching auction data:', err);
        setError('Failed to load auction data. Please try again.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Start auction for a player
  const handleStartAuction = async () => {
    if (!selectedPlayer) {
      showError('Please select a player first');
      return;
    }
    
    try {
      setActionLoading(true);
      await startPlayerAuction(selectedPlayer.id);
      showSuccess(`Auction started for ${selectedPlayer.name}`);
    } catch (err) {
      console.error('Error starting auction:', err);
      showError('Failed to start auction. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Mark player as sold and complete the sale
  const handleCompleteSale = async () => {
    if (!selectedPlayer) {
      showError('Please select a player first');
      return;
    }
    
    try {
      setActionLoading(true);
      const result = await completePlayerSale(selectedPlayer.id);
      
      // Update available players list
      if (currentRound === AUCTION_ROUNDS.MAIN) {
        setAvailablePlayers(prev => prev.filter(p => p.id !== selectedPlayer.id));
      } else {
        setUnsoldPlayers(prev => prev.filter(p => p.id !== selectedPlayer.id));
      }
      
      // Refresh player selection
      setSelectedPlayer(null);
      
      showSuccess(`Player sold to Team ${result.teamId} for ${formatCurrency(result.amount)}`);
    } catch (err) {
      console.error('Error completing sale:', err);
      showError('Failed to complete sale. Please check if there are any bids.');
    } finally {
      setActionLoading(false);
    }
  };

  // Mark player as unsold
  const handleMarkUnsold = async () => {
    if (!selectedPlayer) {
      showError('Please select a player first');
      return;
    }
    
    // Only show confirmation in main round
    if (currentRound === AUCTION_ROUNDS.MAIN) {
      setConfirmAction(() => () => executeMarkUnsold());
      setShowConfirmModal(true);
      return;
    }
    
    executeMarkUnsold();
  };
  
  // Execute marking player as unsold
  const executeMarkUnsold = async () => {
    try {
      setActionLoading(true);
      await markPlayerAsUnsold(selectedPlayer.id);
      
      // End current auction
      await endPlayerAuction();
      
      // Update available players list
      if (currentRound === AUCTION_ROUNDS.MAIN) {
        setAvailablePlayers(prev => prev.filter(p => p.id !== selectedPlayer.id));
        
        // Add to unsold players list
        setUnsoldPlayers(prev => [...prev, { ...selectedPlayer, status: PLAYER_STATUS.UNSOLD }]);
      } else {
        // In unsold round, remove from unsold players list
        setUnsoldPlayers(prev => prev.filter(p => p.id !== selectedPlayer.id));
      }
      
      // Refresh player selection
      setSelectedPlayer(null);
      
      showInfo(`${selectedPlayer.name} marked as unsold`);
    } catch (err) {
      console.error('Error marking player as unsold:', err);
      showError('Failed to mark player as unsold. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Switch to unsold players round
  const handleStartUnsoldRound = () => {
    setCurrentRound(AUCTION_ROUNDS.UNSOLD);
    setSelectedPlayer(null);
    showInfo('Now auctioning unsold players with reduced base price');
  };

  // Handle auction date change
  const handleAuctionDateChange = async (e) => {
    const date = new Date(e.target.value);
    setAuctionDate(date);
    
    try {
      // Update auction settings
      await initializeAuction({
        ...auctionSettings,
        auctionDate: date
      });
      
      showSuccess('Auction date updated successfully');
    } catch (err) {
      console.error('Error updating auction date:', err);
      showError('Failed to update auction date');
    }
  };

  if (loading) {
    return <Loading text="Loading auction data..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-2">Auction Control Panel</h2>
        <p className="text-blue-100">
          {currentRound === AUCTION_ROUNDS.MAIN 
            ? 'Main Round: Players are auctioned at their base price' 
            : 'Unsold Round: Players are auctioned at reduced base price'}
        </p>
        
        {/* Auction Date Setting */}
        <div className="mt-4 pt-4 border-t border-blue-600">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label htmlFor="auctionDate" className="block text-sm font-medium text-blue-100 mb-1">
                Auction Date
              </label>
              <input
                type="datetime-local"
                id="auctionDate"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-700"
                value={auctionDate instanceof Date ? auctionDate.toISOString().slice(0, 16) : ''}
                onChange={handleAuctionDateChange}
              />
            </div>
            <div className="text-sm text-blue-100">
              <p>Auction scheduled for: <strong>{formatDate(auctionDate, { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</strong></p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Messages and Errors */}
      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md">
          <p>{message}</p>
          <button 
            className="text-green-700 font-medium underline mt-1"
            onClick={() => setMessage(null)}
          >
            Dismiss
          </button>
        </div>
      )}
      
      {error && (
        <ErrorMessage 
          message={error} 
          onDismiss={() => setError(null)}
        />
      )}
      
      {/* Auction Controls and Current Player */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Player Selection */}
        <div className="lg:col-span-2">
          <Card 
            title="Select Player for Auction"
            elevation="md"
          >
            {currentRound === AUCTION_ROUNDS.MAIN && availablePlayers.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-gray-500 mb-4">No more available players in the main round.</p>
                {unsoldPlayers.length > 0 && (
                  <Button variant="primary" onClick={handleStartUnsoldRound}>
                    Start Unsold Players Round
                  </Button>
                )}
              </div>
            )}
            
            {currentRound === AUCTION_ROUNDS.UNSOLD && unsoldPlayers.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-gray-500">No unsold players to auction.</p>
              </div>
            )}
            
            {currentRound === AUCTION_ROUNDS.MAIN && availablePlayers.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto p-4">
                {availablePlayers.map(player => (
                  <div 
                    key={player.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${selectedPlayer?.id === player.id ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => setSelectedPlayer(player)}
                  >
                    <PlayerCard player={player} />
                  </div>
                ))}
              </div>
            )}
            
            {currentRound === AUCTION_ROUNDS.UNSOLD && unsoldPlayers.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto p-4">
                {unsoldPlayers.map(player => (
                  <div 
                    key={player.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${selectedPlayer?.id === player.id ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => setSelectedPlayer(player)}
                  >
                    <PlayerCard 
                      player={{
                        ...player,
                        basePrice: Math.floor(player.basePrice * DEFAULT_SETTINGS.UNSOLD_PRICE_REDUCTION) // reduced price for unsold players
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
          <Card title="Auction Actions" elevation="md">
            {selectedPlayer ? (
              <div className="space-y-4 p-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-gray-700 font-medium">Selected Player:</p>
                  <p className="text-xl font-bold text-gray-900">{selectedPlayer.name}</p>
                  <p className="text-gray-700">
                    Base Price: {formatCurrency(currentRound === AUCTION_ROUNDS.UNSOLD 
                      ? Math.floor(selectedPlayer.basePrice * DEFAULT_SETTINGS.UNSOLD_PRICE_REDUCTION)
                      : selectedPlayer.basePrice)}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Button
                    variant="primary"
                    onClick={handleStartAuction}
                    disabled={actionLoading}
                    fullWidth
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    }
                  >
                    Start Auction for This Player
                  </Button>
                  
                  <Button
                    variant="success"
                    onClick={handleCompleteSale}
                    disabled={actionLoading}
                    fullWidth
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    }
                  >
                    Complete Sale (Sold)
                  </Button>
                  
                  <Button
                    variant="warning"
                    onClick={handleMarkUnsold}
                    disabled={actionLoading}
                    fullWidth
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    }
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
            <div className="mt-6 pt-6 border-t border-gray-200 p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Current Round:</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {currentRound === AUCTION_ROUNDS.MAIN ? 'Main Round' : 'Unsold Players Round'}
                </span>
              </div>
              
              {currentRound === AUCTION_ROUNDS.MAIN && unsoldPlayers.length > 0 && (
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
              
              {currentRound === AUCTION_ROUNDS.UNSOLD && (
                <div className="mt-4">
                  <Button
                    variant="secondary"
                    onClick={() => setCurrentRound(AUCTION_ROUNDS.MAIN)}
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
      <Card title="Auction Statistics" elevation="md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
          <div className="bg-blue-50 p-4 rounded-md text-center">
            <p className="text-sm text-blue-600 font-medium">Available Players</p>
            <p className="text-3xl font-bold text-blue-700">{availablePlayers.length}</p>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-md text-center">
            <p className="text-sm text-yellow-600 font-medium">Unsold Players</p>
            <p className="text-3xl font-bold text-yellow-700">{unsoldPlayers.length}</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-md text-center">
            <p className="text-sm text-green-600 font-medium">Min Bid Increment</p>
            <p className="text-3xl font-bold text-green-700">
              {formatCurrency(auctionSettings?.minBidIncrement || DEFAULT_SETTINGS.MIN_BID_INCREMENT)}
            </p>
          </div>
        </div>
      </Card>
      
      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Action"
        size="md"
      >
        <div className="p-4">
          <p className="text-gray-700">
            Are you sure you want to mark <strong>{selectedPlayer?.name}</strong> as unsold?
          </p>
          <p className="mt-2 text-gray-600">
            The player will be moved to the unsold list and can be auctioned again in the unsold players round with a reduced base price.
          </p>
        </div>
        
        <div className="flex justify-end space-x-2 mt-4">
          <Button
            variant="secondary"
            onClick={() => setShowConfirmModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="warning"
            onClick={() => {
              setShowConfirmModal(false);
              if (confirmAction) confirmAction();
            }}
          >
            Mark as Unsold
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default AuctionControls;