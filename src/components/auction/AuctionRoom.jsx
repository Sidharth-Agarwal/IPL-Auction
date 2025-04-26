import React, { useState, useEffect } from 'react';
import { auctionService } from '../../services/auctionService';
import { playerService } from '../../services/playerService';
import { teamService } from '../../services/teamService';

const AuctionRoom = () => {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [currentBids, setCurrentBids] = useState([]);
  const [auctionStatus, setAuctionStatus] = useState('not_started');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [bidAmount, setBidAmount] = useState('');

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
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
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchInitialData();
  }, []);

  // Start auction
  const startAuction = async () => {
    if (players.length === 0) {
      alert('No players available for auction');
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

      setCurrentPlayer(firstPlayer);
      setAuctionStatus('active');
    } catch (error) {
      console.error('Error starting auction:', error);
    }
  };

  // Place bid
  const placeBid = async () => {
    if (!selectedTeam) {
      alert('Please select a team');
      return;
    }

    const bidValue = parseFloat(bidAmount);
    if (isNaN(bidValue) || bidValue <= 0) {
      alert('Please enter a valid bid amount');
      return;
    }

    try {
      // Check team wallet
      if (selectedTeam.wallet < bidValue) {
        alert('Insufficient team wallet balance');
        return;
      }

      // Place bid
      await auctionService.placeBid({
        teamId: selectedTeam.id,
        playerId: currentPlayer.id,
        bidAmount: bidValue
      });

      // Fetch updated bids for current player
      const playerBids = await auctionService.getBidsForPlayer(
        currentPlayer.id
      );

      setCurrentBids(playerBids);
      setBidAmount('');
    } catch (error) {
      console.error('Error placing bid:', error);
    }
  };

  // Move to next player
  const moveToNextPlayer = async () => {
    // Determine the winner of the current player
    const highestBid = currentBids.reduce(
      (max, bid) => bid.bidAmount > max.bidAmount ? bid : max,
      { bidAmount: 0 }
    );

    if (highestBid.bidAmount > 0) {
      // Update player status and team
      await playerService.updatePlayer(currentPlayer.id, {
        status: 'sold',
        soldTo: highestBid.teamId
      });

      // Update team's wallet and players
      await teamService.updateTeam(highestBid.teamId, {
        wallet: highestBid.teamId.wallet - highestBid.bidAmount,
        players: [...highestBid.teamId.players, currentPlayer.id]
      });
    } else {
      // Mark player as unsold
      await playerService.updatePlayer(currentPlayer.id, {
        status: 'unsold'
      });
    }

    // Move to next player
    const remainingPlayers = players.filter(
      p => p.status === 'available'
    );

    if (remainingPlayers.length > 0) {
      const nextPlayer = remainingPlayers[0];
      setCurrentPlayer(nextPlayer);
      setCurrentBids([]);
    } else {
      // Auction completed
      await auctionService.completeAuction();
      setAuctionStatus('completed');
    }
  };

  // Render auction status
  const renderAuctionStatus = () => {
    switch (auctionStatus) {
      case 'not_started':
        return (
          <button 
            onClick={startAuction}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Start Auction
          </button>
        );
      case 'active':
        return (
          <div className="auction-active">
            <h2>Current Player: {currentPlayer.name}</h2>
            <div className="bid-section">
              <select 
                value={selectedTeam?.id || ''}
                onChange={(e) => {
                  const team = teams.find(t => t.id === e.target.value);
                  setSelectedTeam(team);
                }}
              >
                <option value="">Select Team</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>
                    {team.name} (Wallet: {team.wallet})
                  </option>
                ))}
              </select>
              <input 
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder="Bid Amount"
              />
              <button 
                onClick={placeBid}
                disabled={!selectedTeam}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Place Bid
              </button>
            </div>
            <div className="current-bids">
              <h3>Current Bids</h3>
              {currentBids.map(bid => (
                <div key={bid.id}>
                  Team: {teams.find(t => t.id === bid.teamId)?.name}
                  Bid: {bid.bidAmount}
                </div>
              ))}
              <button 
                onClick={moveToNextPlayer}
                className="bg-yellow-500 text-white px-4 py-2 rounded"
              >
                Next Player
              </button>
            </div>
          </div>
        );
      case 'completed':
        return <h2>Auction Completed</h2>;
      default:
        return null;
    }
  };

  return (
    <div className="auction-room container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Auction Room</h1>
      {renderAuctionStatus()}
    </div>
  );
};

export default AuctionRoom;