// src/contexts/AuctionContext.js
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { playerService } from '../services/playerService';
import { teamService } from '../services/teamService';
import { auctionService } from '../services/auctionService';

const AuctionContext = createContext(null);

export const AuctionProvider = ({ children }) => {
  // Auction state
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [currentBids, setCurrentBids] = useState([]);
  const [auctionStatus, setAuctionStatus] = useState('not_started');
  const [currentAuction, setCurrentAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch initial data
  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [fetchedPlayers, fetchedTeams] = await Promise.all([
        playerService.getAllPlayers(),
        teamService.getAllTeams()
      ]);

      // Filter available players
      const availablePlayers = fetchedPlayers.filter(
        player => player.status === 'available'
      );

      setPlayers(availablePlayers);
      setTeams(fetchedTeams);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch initial auction data');
      setLoading(false);
    }
  }, []);

  // Start auction
  const startAuction = useCallback(async () => {
    if (players.length === 0) {
      setError('No players available for auction');
      return;
    }

    try {
      // Create a new auction
      const newAuction = await auctionService.createAuction({
        totalPlayers: players.length
      });

      // Set first player
      const firstPlayer = players[0];
      await auctionService.updateCurrentPlayer(newAuction.id, firstPlayer.id);

      setCurrentAuction(newAuction);
      setCurrentPlayer(firstPlayer);
      setAuctionStatus('active');
    } catch (err) {
      setError('Failed to start auction');
    }
  }, [players]);

  // Place bid
  const placeBid = useCallback(async (teamId, bidAmount) => {
    if (!currentPlayer || !currentAuction) {
      setError('No active auction or current player');
      return null;
    }

    try {
      const newBid = await auctionService.placeBid({
        teamId,
        playerId: currentPlayer.id,
        auctionId: currentAuction.id,
        bidAmount
      });

      setCurrentBids(prev => [...prev, newBid]);
      return newBid;
    } catch (err) {
      setError('Failed to place bid');
      return null;
    }
  }, [currentPlayer, currentAuction]);

  // Move to next player
  const moveToNextPlayer = useCallback(async () => {
    if (!currentPlayer || !currentAuction) return;

    try {
      // Determine the winner of the current player
      const highestBid = currentBids.reduce(
        (max, bid) => bid.bidAmount > max.bidAmount ? bid : max,
        { bidAmount: 0, teamId: null }
      );

      if (highestBid.teamId) {
        // Update player status and mark as sold
        await playerService.updatePlayer(currentPlayer.id, {
          status: 'sold',
          soldTo: highestBid.teamId
        });

        // Update team's wallet and add player
        const winningTeam = teams.find(t => t.id === highestBid.teamId);
        await teamService.updateTeam(highestBid.teamId, {
          wallet: winningTeam.wallet - highestBid.bidAmount,
          players: [...(winningTeam.players || []), currentPlayer.id]
        });
      } else {
        // Mark player as unsold
        await playerService.updatePlayer(currentPlayer.id, {
          status: 'unsold'
        });
      }

      // Move to next available player
      const remainingPlayers = players.filter(p => p.status === 'available');
      
      if (remainingPlayers.length > 0) {
        const nextPlayer = remainingPlayers[0];
        setCurrentPlayer(nextPlayer);
        setCurrentBids([]);
      } else {
        // Auction completed
        await auctionService.completeAuction(currentAuction.id);
        setAuctionStatus('completed');
      }
    } catch (err) {
      setError('Failed to move to next player');
    }
  }, [currentPlayer, currentAuction, currentBids, players, teams]);

  // Reset auction
  const resetAuction = useCallback(() => {
    setPlayers([]);
    setTeams([]);
    setCurrentPlayer(null);
    setCurrentBids([]);
    setAuctionStatus('not_started');
    setCurrentAuction(null);
    fetchInitialData();
  }, [fetchInitialData]);

  // Fetch initial data on mount
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Prepare context value
  const contextValue = {
    players,
    teams,
    currentPlayer,
    currentBids,
    auctionStatus,
    currentAuction,
    loading,
    error,
    startAuction,
    placeBid,
    moveToNextPlayer,
    resetAuction,
    setError
  };

  return (
    <AuctionContext.Provider value={contextValue}>
      {children}
    </AuctionContext.Provider>
  );
};

// Custom hook to use auction context
export const useAuction = () => {
  const context = useContext(AuctionContext);
  if (context === null) {
    throw new Error('useAuction must be used within an AuctionProvider');
  }
  return context;
};