// src/components/auction/AuctionRoom.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  subscribeToAuctionSettings, 
  subscribeToPlayerBids, 
  placeBid 
} from '../../services/auctionService';
import { getPlayer } from '../../services/playerService';
import { getTeam } from '../../services/teamService';
import Card from '../common/Card';
import Button from '../common/Button';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';
import PlayerDisplay from './PlayerDisplay';
import BiddingPanel from './BiddingPanel';
import TeamDashboard from './TeamDashboard';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { DEFAULT_SETTINGS } from '../../utils/constants';
import { useNotification } from '../../context/NotificationContext';

const AuctionRoom = ({ teamId = null }) => {
  const [auctionActive, setAuctionActive] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [bids, setBids] = useState([]);
  const [highestBid, setHighestBid] = useState(null);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [auctionDate, setAuctionDate] = useState(null);
  const [bidLocked, setBidLocked] = useState(false);
  
  const { showSuccess, showError } = useNotification();

  // Subscribe to auction settings changes
  useEffect(() => {
    let unsubscribeSettings;
    let unsubscribeBids;
    
    const setupSubscriptions = async () => {
      try {
        setLoading(true);
        
        // Subscribe to auction settings
        unsubscribeSettings = subscribeToAuctionSettings((settings) => {
          if (settings) {
            setAuctionActive(settings.isActive || false);
            setAuctionDate(settings.auctionDate || null);
            
            // If there's a current player being auctioned, fetch player details
            if (settings.isActive && settings.currentPlayerId) {
              fetchPlayerDetails(settings.currentPlayerId);
            } else {
              setCurrentPlayer(null);
              setBids([]);
              setHighestBid(null);
              
              // Unsubscribe from previous player's bids if any
              if (unsubscribeBids) {
                unsubscribeBids();
                unsubscribeBids = null;
              }
            }
          }
        });
        
        // If teamId is provided, fetch team details
        if (teamId) {
          try {
            const teamData = await getTeam(teamId);
            setTeam(teamData);
          } catch (teamError) {
            console.error('Error loading team:', teamError);
            showError('Failed to load team details');
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error setting up auction subscriptions:', err);
        setError('Failed to connect to the auction. Please try refreshing the page.');
        setLoading(false);
      }
    };
    
    setupSubscriptions();
    
    // Fetch player details and subscribe to bids
    const fetchPlayerDetails = async (playerId) => {
      try {
        // Fetch player details
        const player = await getPlayer(playerId);
        setCurrentPlayer(player);
        
        // Unsubscribe from previous player's bids if any
        if (unsubscribeBids) {
          unsubscribeBids();
        }
        
        // Subscribe to bids for this player
        unsubscribeBids = subscribeToPlayerBids(playerId, (updatedBids) => {
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
      } catch (err) {
        console.error('Error fetching player details:', err);
        showError('Failed to load current player details');
      }
    };
    
    // Cleanup subscriptions on component unmount
    return () => {
      if (unsubscribeSettings) {
        unsubscribeSettings();
      }
      if (unsubscribeBids) {
        unsubscribeBids();
      }
    };
  }, [teamId, showError]);

  // Handle placing a bid
  const handlePlaceBid = async (amount) => {
    if (!teamId || !currentPlayer || !auctionActive) {
      showError('Cannot place bid - auction is not active');
      return;
    }
    
    // Prevent duplicate bids
    if (bidLocked) return;
    
    try {
      setBidLocked(true);
      await placeBid(currentPlayer.id, teamId, amount);
      showSuccess('Bid placed successfully!');
    } catch (err) {
      console.error('Error placing bid:', err);
      showError(`Failed to place bid: ${err.message || 'Unknown error'}`);
    } finally {
      // Unlock bidding after a short delay to prevent spam
      setTimeout(() => {
        setBidLocked(false);
      }, 1000);
    }
  };

  // Calculate minimum bid amount
  const calculateMinBid = () => {
    // If no current highest bid, return player's base price
    if (!highestBid) {
      return currentPlayer?.basePrice || DEFAULT_SETTINGS.DEFAULT_WALLET_AMOUNT;
    }
    
    // Add minimum increment
    const minIncrement = DEFAULT_SETTINGS.MIN_BID_INCREMENT;
    return highestBid.amount + minIncrement;
  };

  if (loading) {
    return <Loading text="Connecting to auction room..." />;
  }

  return (
    <div className="space-y-6">
      {/* Auction Status Banner */}
      <div className={`rounded-lg p-4 text-white ${auctionActive ? 'bg-green-600' : 'bg-gray-600'}`}>
        <div className="flex items-center">
          <div className={`h-3 w-3 rounded-full mr-2 ${auctionActive ? 'bg-green-300 animate-pulse' : 'bg-gray-300'}`}></div>
          <p className="font-medium">
            {auctionActive 
              ? 'Auction is LIVE - Bidding in progress' 
              : 'Auction is currently INACTIVE - Waiting for next player'}
          </p>
          
          {auctionDate && !auctionActive && (
            <div className="ml-auto text-sm">
              <span>Scheduled for: </span>
              <span className="font-medium">
                {formatDate(auctionDate, {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Error Display */}
      {error && (
        <ErrorMessage 
          message={error} 
          onDismiss={() => setError(null)}
        />
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
                
                {auctionDate && (
                  <p className="mt-4 text-sm text-blue-600 font-medium">
                    Auction scheduled for: {formatDate(auctionDate, {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                )}
              </div>
            </Card>
          )}
        </div>
        
        {/* Bidding Panel and Team Dashboard */}
        <div className="space-y-6">
          {/* Team Dashboard */}
          {team && (
            <TeamDashboard 
              team={team} 
              highestBid={highestBid} 
              currentPlayer={currentPlayer}
            />
          )}
          
          {/* Bidding Panel */}
          {auctionActive && currentPlayer && teamId && (
            <BiddingPanel 
              minBid={calculateMinBid()}
              onPlaceBid={handlePlaceBid}
              highestBid={highestBid}
              isHighestBidder={highestBid?.teamId === teamId}
              disabled={!auctionActive || !team || team.wallet < calculateMinBid() || bidLocked}
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
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bid Amount
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                          {bid.teamName || `Team ${bid.teamId.substring(0, 5)}...`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right text-green-600">
                          {formatCurrency(bid.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                          {bid.timestamp ? formatDate(bid.timestamp, {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          }) : 'Just now'}
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

AuctionRoom.propTypes = {
  teamId: PropTypes.string
};

export default AuctionRoom;