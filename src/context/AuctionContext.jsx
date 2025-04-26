// src/context/AuctionContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  getAuctionSettings, 
  subscribeToAuctionSettings,
  subscribeToPlayerBids,
  getHighestBid,
  placeBid
} from '../services/auctionService';
import { getPlayer } from '../services/playerService';
import { auctionSettings } from '../firebase/config';

// Create context
export const AuctionContext = createContext();

export const AuctionProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [bids, setBids] = useState([]);
  const [highestBid, setHighestBid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [auctionActive, setAuctionActive] = useState(false);
  const [loadingBid, setLoadingBid] = useState(false);
  const [bidError, setBidError] = useState(null);
  const [bidSuccess, setBidSuccess] = useState(false);

  // Load initial auction settings
  useEffect(() => {
    const loadAuctionSettings = async () => {
      try {
        setLoading(true);
        const settingsData = await getAuctionSettings();
        setSettings(settingsData);
        
        // If there's an active auction with a current player, load that player
        if (settingsData && settingsData.isActive && settingsData.currentPlayerId) {
          setAuctionActive(true);
          await loadCurrentPlayer(settingsData.currentPlayerId);
        } else {
          setAuctionActive(false);
          setCurrentPlayer(null);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load auction settings');
        setLoading(false);
        console.error(err);
      }
    };
    
    loadAuctionSettings();
  }, []);

  // Subscribe to auction settings changes
  useEffect(() => {
    const unsubscribe = subscribeToAuctionSettings((updatedSettings) => {
      if (!updatedSettings) return;
      
      setSettings(updatedSettings);
      setAuctionActive(updatedSettings.isActive);
      
      // If current player changes, load the new player
      if (updatedSettings.isActive && updatedSettings.currentPlayerId) {
        if (!currentPlayer || currentPlayer.id !== updatedSettings.currentPlayerId) {
          loadCurrentPlayer(updatedSettings.currentPlayerId);
        }
      } else if (!updatedSettings.isActive) {
        // Auction is not active
        setCurrentPlayer(null);
        setBids([]);
        setHighestBid(null);
      }
    });
    
    return () => unsubscribe();
  }, [currentPlayer]);

  // Load current player being auctioned
  const loadCurrentPlayer = async (playerId) => {
    try {
      const player = await getPlayer(playerId);
      setCurrentPlayer(player);
      
      // Also load current bids for this player
      const unsubscribeBids = subscribeToPlayerBids(playerId, (updatedBids) => {
        setBids(updatedBids);
        
        // Update highest bid
        if (updatedBids.length > 0) {
          const highest = updatedBids.reduce((max, bid) => 
            (!max || bid.amount > max.amount) ? bid : max, null);
          setHighestBid(highest);
        } else {
          setHighestBid(null);
        }
      });
      
      // Return cleanup function
      return () => {
        if (unsubscribeBids) {
          unsubscribeBids();
        }
      };
    } catch (err) {
      setError('Failed to load current player');
      console.error(err);
    }
  };

  // Handle placing a bid
  const handlePlaceBid = async (teamId, amount) => {
    if (!currentPlayer || !auctionActive) {
      setBidError('Cannot place bid - auction is not active');
      return false;
    }
    
    try {
      setLoadingBid(true);
      setBidError(null);
      setBidSuccess(false);
      
      await placeBid(currentPlayer.id, teamId, amount);
      
      setBidSuccess(true);
      setLoadingBid(false);
      
      // Clear success status after 3 seconds
      setTimeout(() => {
        setBidSuccess(false);
      }, 3000);
      
      return true;
    } catch (err) {
      setBidError(err.message || 'Failed to place bid');
      setLoadingBid(false);
      console.error(err);
      return false;
    }
  };

  // Calculate minimum bid amount
  const getMinimumBidAmount = () => {
    if (!currentPlayer) return 0;
    
    // If no bids yet, return base price
    if (!highestBid) {
      return currentPlayer.basePrice;
    }
    
    // Add minimum increment to highest bid
    const minIncrement = settings?.minBidIncrement || auctionSettings.minBidIncrement;
    return highestBid.amount + minIncrement;
  };

  // Check if a team has highest bid
  const isHighestBidder = (teamId) => {
    return highestBid && highestBid.teamId === teamId;
  };

  // Context value
  const value = {
    auctionActive,
    currentPlayer,
    bids,
    highestBid,
    minBidIncrement: settings?.minBidIncrement || auctionSettings.minBidIncrement,
    loading,
    error,
    loadingBid,
    bidError,
    bidSuccess,
    placeBid: handlePlaceBid,
    getMinimumBidAmount,
    isHighestBidder
  };

  return (
    <AuctionContext.Provider value={value}>
      {children}
    </AuctionContext.Provider>
  );
};

// Custom hook to use the auction context
export const useAuction = () => {
  const context = useContext(AuctionContext);
  if (!context) {
    throw new Error('useAuction must be used within an AuctionProvider');
  }
  return context;
};