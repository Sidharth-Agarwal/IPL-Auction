// src/components/auction/AuctionRoom.js
import React, { useState, useEffect } from 'react';
import { 
  subscribeToAuctionSettings, 
  subscribeToPlayerBids, 
  placeBid 
} from '../../services/auctionService';
import { getPlayer } from '../../services/playerService';
import { getTeam } from '../../services/teamService';
import Card from '../common/Card';
import Button from '../common/Button';
import PlayerDisplay from './PlayerDisplay';
import BiddingPanel from './BiddingPanel';
import TeamDashboard from './TeamDashboard';

const AuctionRoom = ({ teamId = null }) => {
  const [auctionActive, setAuctionActive] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [bids, setBids] = useState([]);
  const [highestBid, setHighestBid] = useState(null);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Subscribe to auction settings changes
  useEffect(() => {
    const unsubscribeSettings = subscribeToAuctionSettings((settings) => {
      if (settings) {
        setAuctionActive(settings.isActive);
        
        // If there's a current player being auctioned, fetch player details
        if (settings.isActive && settings.currentPlayerId) {
          fetchPlayerDetails(settings.currentPlayerId);
        } else {
          setCurrentPlayer(null);
          setBids([]);
          setHighestBid(null);
        }
      }
    });
    
    return () => {
      if (unsubscribeSettings) {
        unsubscribeSettings();
      }
    };
  }, []);

  // If teamId is provided, fetch team details
  useEffect(() => {
    if (teamId) {
      const fetchTeam = async () => {
        try {
          const teamData = await getTeam(teamId);
          setTeam(teamData);
        } catch (err) {
          setError('Failed to load team details');
          console.error(err);
        }
      };
      
      fetchTeam();
    }
  }, [teamId]);

  // Fetch current player details and subscribe to bids
  const fetchPlayerDetails = async (playerId) => {
    try {
      setLoading(true);
      
      // Fetch player details
      const player = await getPlayer(playerId);
      setCurrentPlayer(player);
      
      // Subscribe to bids for this player
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
      
      setLoading(false);
      
      // Return cleanup function
      return () => {
        if (unsubscribeBids) {
          unsubscribeBids();
        }
      };
    } catch (err) {
      setError('Failed to load player details');
      setLoading(false);
      console.error(err);
    }
  };

  // Handle placing a bid
  const handlePlaceBid = async (amount) => {
    if (!teamId || !currentPlayer) {
      return;
    }
    
    try {
      await placeBid(currentPlayer.id, teamId, amount);
      setMessage('Bid placed successfully!');
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (err) {
      setError(`Failed to place bid: ${err.message}`);
      console.error(err);
      
      // Clear error after 5 seconds
      setTimeout(() => {
        setError(null);
      }, 5000);
    }
  };

  // Calculate minimum bid amount
  const calculateMinBid = () => {
    // If no current highest bid, return player's base price
    if (!highestBid) {
      return currentPlayer?.basePrice || 1000;
    }
    
    // Add minimum increment (usually 100 or 5% of current highest bid)
    const minIncrement = 100; // This should come from auction settings
    return highestBid.amount + minIncrement;
  };

  if (loading && !currentPlayer) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Auction Status Banner */}
      <div className={`rounded-lg p-4 text-white ${auctionActive ? 'bg-green-600' : 'bg-red-600'}`}>
        <div className="flex items-center">
          <div className={`h-3 w-3 rounded-full mr-2 ${auctionActive ? 'bg-green-300 animate-pulse' : 'bg-red-300'}`}></div>
          <p className="font-medium">
            {auctionActive 
              ? 'Auction is LIVE - Bidding in progress' 
              : 'Auction is currently INACTIVE - Waiting for next player'}
          </p>
        </div>
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
      
      {/* Main Auction Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Player Display */}
        <div className="lg:col-span-2">
          {currentPlayer ? (
            <PlayerDisplay player={currentPlayer} highestBid={highestBid} />
          ) : (
            <Card className="h-full flex items-center justify-center">
              <div className="text-center py-12">
                <svg 
                  className="mx-auto h-12 w-12 text-gray-400" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">Waiting for Auction</h3>
                <p className="mt-1 text-sm text-gray-500">
                  The auction is not currently active. Please wait for the admin to start the auction for the next player.
                </p>
              </div>
            </Card>
          )}
        </div>
        
        {/* Bidding Panel and Team Dashboard */}
        <div className="space-y-6">
          {/* Team Dashboard */}
          {team && (
            <TeamDashboard team={team} highestBid={highestBid} />
          )}
          
          {/* Bidding Panel */}
          {auctionActive && currentPlayer && teamId && (
            <BiddingPanel 
              minBid={calculateMinBid()}
              onPlaceBid={handlePlaceBid}
              highestBid={highestBid}
              isHighestBidder={highestBid?.teamId === teamId}
              disabled={!auctionActive || !team || team.wallet < calculateMinBid()}
            />
          )}
          
          {/* Bid History */}
          <Card title="Bid History">
            {bids.length === 0 ? (
              <div className="py-4 text-center text-gray-500">
                No bids yet. Be the first to bid!
              </div>
            ) : (
              <div className="overflow-y-auto max-h-64">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Team
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bid Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bids.map((bid, index) => (
                      <tr 
                        key={bid.id || index} 
                        className={`
                          ${index === 0 ? 'bg-green-50' : ''}
                          ${bid.teamId === teamId ? 'bg-blue-50' : ''}
                        `}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {/* We would normally fetch team name here */}
                          Team {bid.teamId.substring(0, 5)}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          ${bid.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {bid.timestamp ? new Date(bid.timestamp.seconds * 1000).toLocaleTimeString() : 'Just now'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuctionRoom;