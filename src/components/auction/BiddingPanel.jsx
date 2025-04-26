import React, { useState, useEffect } from 'react';
import { auctionService } from '../../services/auctionService';
import { teamService } from '../../services/teamService';

const BiddingPanel = ({ currentPlayer, teams, onBidPlaced, onNextPlayer }) => {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [currentBids, setCurrentBids] = useState([]);
  const [error, setError] = useState('');

  // Fetch current bids when current player changes
  useEffect(() => {
    const fetchCurrentBids = async () => {
      if (currentPlayer) {
        try {
          const bids = await auctionService.getBidsForPlayer(
            currentPlayer.id
          );
          setCurrentBids(bids);
        } catch (error) {
          console.error('Error fetching bids:', error);
        }
      }
    };

    fetchCurrentBids();
  }, [currentPlayer]);

  // Handle bid placement
  const handlePlaceBid = async () => {
    // Reset previous errors
    setError('');

    // Validate inputs
    if (!selectedTeam) {
      setError('Please select a team');
      return;
    }

    const parsedBidAmount = parseFloat(bidAmount);
    if (isNaN(parsedBidAmount) || parsedBidAmount <= 0) {
      setError('Please enter a valid bid amount');
      return;
    }

    // Check team wallet
    if (selectedTeam.wallet < parsedBidAmount) {
      setError('Insufficient team wallet balance');
      return;
    }

    try {
      // Place bid
      const newBid = await auctionService.placeBid({
        teamId: selectedTeam.id,
        playerId: currentPlayer.id,
        bidAmount: parsedBidAmount
      });

      // Update current bids
      setCurrentBids(prev => [...prev, newBid]);

      // Callback to parent component
      onBidPlaced(newBid);

      // Reset bid amount
      setBidAmount('');
    } catch (error) {
      setError('Failed to place bid');
      console.error('Bid placement error:', error);
    }
  };

  // Determine highest bid
  const highestBid = currentBids.reduce(
    (max, bid) => bid.bidAmount > max.bidAmount ? bid : max,
    { bidAmount: 0 }
  );

  return (
    <div className="bidding-panel bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">
        Bidding for {currentPlayer?.name}
      </h2>

      {/* Team Selection */}
      <div className="mb-4">
        <label 
          htmlFor="team-select" 
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Select Team
        </label>
        <select
          id="team-select"
          value={selectedTeam?.id || ''}
          onChange={(e) => {
            const team = teams.find(t => t.id === e.target.value);
            setSelectedTeam(team);
          }}
          className="w-full px-3 py-2 border rounded-md"
        >
          <option value="">Choose a Team</option>
          {teams.map(team => (
            <option key={team.id} value={team.id}>
              {team.name} (Wallet: {team.wallet})
            </option>
          ))}
        </select>
      </div>

      {/* Bid Input */}
      <div className="mb-4">
        <label 
          htmlFor="bid-amount" 
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Bid Amount
        </label>
        <input
          id="bid-amount"
          type="number"
          value={bidAmount}
          onChange={(e) => setBidAmount(e.target.value)}
          placeholder="Enter bid amount"
          className="w-full px-3 py-2 border rounded-md"
          disabled={!selectedTeam}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
          {error}
        </div>
      )}

      {/* Bid Button */}
      <button
        onClick={handlePlaceBid}
        disabled={!selectedTeam || !bidAmount}
        className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-300 mb-4"
      >
        Place Bid
      </button>

      {/* Current Bids */}
      <div className="current-bids">
        <h3 className="text-lg font-semibold mb-2">Current Bids</h3>
        {currentBids.length === 0 ? (
          <p className="text-gray-500">No bids yet</p>
        ) : (
          <ul className="space-y-2">
            {currentBids.map(bid => {
              const bidderTeam = teams.find(t => t.id === bid.teamId);
              return (
                <li 
                  key={bid.id} 
                  className={`flex justify-between p-2 rounded ${
                    bid.id === highestBid.id 
                      ? 'bg-green-100' 
                      : 'bg-gray-100'
                  }`}
                >
                  <span>{bidderTeam?.name}</span>
                  <span>{bid.bidAmount}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Next Player Button */}
      <button
        onClick={onNextPlayer}
        className="w-full mt-4 bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition duration-300"
      >
        Move to Next Player
      </button>
    </div>
  );
};

export default BiddingPanel;