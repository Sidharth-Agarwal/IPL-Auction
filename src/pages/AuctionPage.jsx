import React, { useState, useEffect } from 'react';
import { playerService } from '../services/playerService';
import { teamService } from '../services/teamService';
import { auctionService } from '../services/auctionService';
import AuctionDashboard from '../components/auction/AuctionDashboard';

const AuctionPage = () => {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [currentBids, setCurrentBids] = useState([]);
  const [auctionStatus, setAuctionStatus] = useState('not_started');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [activeView, setActiveView] = useState('dashboard');
  const [error, setError] = useState('');

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const fetchedPlayers = await playerService.getAllPlayers();
        const fetchedTeams = await teamService.getAllTeams();

        // Filter available players
        const availablePlayers = fetchedPlayers.filter(
          player => player.status === 'available'
        );

        setPlayers(availablePlayers);
        setTeams(fetchedTeams);
      } catch (error) {
        setError('Failed to fetch initial auction data');
        console.error(error);
      }
    };

    fetchInitialData();
  }, []);

  // Start auction
  const startAuction = () => {
    if (players.length === 0) {
      setError('No players available for auction');
      return;
    }

    // Set first player
    const firstPlayer = players[0];
    setCurrentPlayer(firstPlayer);
    setAuctionStatus('active');
    setActiveView('auction');
  };

  // Place bid
  const placeBid = () => {
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

    // Create new bid
    const newBid = {
      teamId: selectedTeam.id,
      teamName: selectedTeam.name,
      bidAmount: parsedBidAmount,
      timestamp: new Date()
    };

    // Update current bids
    setCurrentBids(prev => [...prev, newBid]);

    // Clear bid input
    setBidAmount('');
    setError('');
  };

  // Move to next player
  const moveToNextPlayer = async () => {
    // Determine the winner of the current player
    const highestBid = currentBids.reduce(
      (max, bid) => bid.bidAmount > max.bidAmount ? bid : max,
      { bidAmount: 0, teamId: null }
    );

    try {
      if (highestBid.teamId) {
        // Update player as sold
        await playerService.updatePlayer(currentPlayer.id, {
          status: 'sold',
          soldTo: highestBid.teamId
        });

        // Update winning team's wallet and players
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

      // Find next available player
      const remainingPlayers = players.filter(p => p.status === 'available');
      
      if (remainingPlayers.length > 0) {
        const nextPlayer = remainingPlayers[0];
        setCurrentPlayer(nextPlayer);
        setCurrentBids([]);
        setSelectedTeam(null);
      } else {
        // Auction completed
        setAuctionStatus('completed');
      }
    } catch (error) {
      setError('Failed to process player auction');
      console.error(error);
    }
  };

  // Navigation tabs
  const tabs = [
    { 
      id: 'dashboard', 
      label: 'Auction Dashboard', 
      icon: '📊'
    },
    { 
      id: 'auction', 
      label: 'Auction Room', 
      icon: '🔨'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Auction Management
      </h1>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200 flex space-x-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id)}
            className={`
              py-2 px-4 flex items-center space-x-2 border-b-2 font-medium text-sm
              ${activeView === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <span className="text-lg">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Dynamic Content */}
      {activeView === 'dashboard' && <AuctionDashboard />}

      {/* Auction Room */}
      {activeView === 'auction' && (
        <div>
          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              {error}
            </div>
          )}

          {/* Auction Status Control */}
          {auctionStatus === 'not_started' && (
            <div className="text-center mb-8">
              <button 
                onClick={startAuction}
                className="bg-green-500 text-white px-6 py-3 rounded-lg text-xl hover:bg-green-600 transition duration-300"
              >
                Start Auction
              </button>
            </div>
          )}

          {/* Active Auction */}
          {auctionStatus === 'active' && currentPlayer && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Player Details */}
              <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">
                  Current Player: {currentPlayer.name}
                </h2>
                <div className="space-y-2">
                  <p><strong>Category:</strong> {currentPlayer.category}</p>
                  <p><strong>Base Price:</strong> ₹{currentPlayer.basePrice}</p>
                  {currentPlayer.imageUrl && (
                    <img 
                      src={currentPlayer.imageUrl} 
                      alt={currentPlayer.name} 
                      className="w-48 h-48 object-cover rounded-lg mt-4"
                    />
                  )}
                </div>
              </div>

              {/* Bidding Panel */}
              <div className="bg-white shadow-md rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Bidding Panel</h3>
                
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
                        {team.name} (Wallet: ₹{team.wallet})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Bid Amount Input */}
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
                    disabled={!selectedTeam}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                {/* Bid Button */}
                <button
                  onClick={placeBid}
                  disabled={!selectedTeam || !bidAmount}
                  className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-300 mb-4"
                >
                  Place Bid
                </button>

                {/* Current Bids */}
                <div>
                  <h4 className="text-lg font-semibold mb-2">Current Bids</h4>
                  {currentBids.length === 0 ? (
                    <p className="text-gray-500">No bids yet</p>
                  ) : (
                    <ul className="space-y-2">
                      {currentBids.map((bid, index) => (
                        <li 
                          key={index} 
                          className="flex justify-between p-2 bg-gray-100 rounded"
                        >
                          <span>{bid.teamName}</span>
                          <span>₹{bid.bidAmount}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Next Player Button */}
                <button
                  onClick={moveToNextPlayer}
                  className="w-full mt-4 bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition duration-300"
                >
                  Move to Next Player
                </button>
              </div>
            </div>
          )}

          {/* Auction Completed */}
          {auctionStatus === 'completed' && (
            <div className="text-center py-12 bg-white shadow-md rounded-lg">
              <h2 className="text-3xl font-bold text-green-600 mb-4">
                Auction Completed
              </h2>
              <p className="text-gray-600 mb-6">
                All players have been auctioned.
              </p>
              <button
                onClick={() => setActiveView('dashboard')}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-300"
              >
                View Auction Dashboard
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AuctionPage;