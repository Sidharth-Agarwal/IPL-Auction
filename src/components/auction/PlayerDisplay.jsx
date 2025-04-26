// src/components/auction/PlayerDisplay.jsx
import React from 'react';
import PropTypes from 'prop-types';
import Card from '../common/Card';
import { formatCurrency } from '../../utils/formatters';
import { ROLE_COLORS } from '../../utils/constants';

const PlayerDisplay = ({ player, highestBid }) => {
  if (!player) return null;
  
  // Helper function to format player stats
  const formatStats = (stats) => {
    if (!stats || Object.keys(stats).length === 0) {
      return null;
    }
    
    // Common stats to display
    const displayStats = [
      { key: 'matches', label: 'Matches' },
      { key: 'runs', label: 'Runs' },
      { key: 'average', label: 'Average' },
      { key: 'strikeRate', label: 'Strike Rate' },
      { key: 'wickets', label: 'Wickets' },
      { key: 'economy', label: 'Economy' },
      { key: 'centuries', label: 'Centuries' },
      { key: 'fifties', label: 'Fifties' }
    ];
    
    return displayStats
      .filter(stat => stats[stat.key] !== undefined)
      .map(stat => ({
        label: stat.label,
        value: stats[stat.key]
      }));
  };
  
  const playerStats = formatStats(player.stats);
  const roleColor = ROLE_COLORS[player.role] || ROLE_COLORS.default;
  
  // Countdown timer for bidding - to be implemented
  const renderBiddingTimer = () => {
    // In a future version, we could implement a countdown timer here
    return null;
  };
  
  return (
    <Card className="overflow-hidden">
      {/* Header with player name and current bid */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold">{player.name}</h2>
        {highestBid ? (
          <div className="text-right">
            <p className="text-sm text-blue-200">Current Highest Bid</p>
            <p className="text-2xl font-bold">{formatCurrency(highestBid.amount)}</p>
          </div>
        ) : (
          <div className="text-right">
            <p className="text-sm text-blue-200">Base Price</p>
            <p className="text-xl font-bold">{formatCurrency(player.basePrice)}</p>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Player Image and Basic Info */}
          <div className="md:col-span-1">
            <div className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden bg-gray-200 mb-4">
              {player.image ? (
                <img 
                  src={player.image} 
                  alt={player.name} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/assets/images/player-placeholder.png';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-6xl font-bold text-gray-400">
                    {player.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              {/* Role Badge */}
              {player.role && (
                <div className="flex justify-center">
                  <span className={`px-4 py-1 rounded-full text-sm font-medium ${roleColor.bg} ${roleColor.text}`}>
                    {player.role}
                  </span>
                </div>
              )}
              
              {/* Player Details */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Batting:</span>
                  <span className="font-medium">{player.battingStyle || 'N/A'}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Bowling:</span>
                  <span className="font-medium">{player.bowlingStyle || 'N/A'}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Price:</span>
                  <span className="font-medium text-green-600">{formatCurrency(player.basePrice)}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Player Stats */}
          <div className="md:col-span-2">
            <h3 className="text-xl font-semibold mb-4">Player Statistics</h3>
            
            {!playerStats || playerStats.length === 0 ? (
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <p className="text-gray-500">No statistics available for this player</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {playerStats.map((stat, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                ))}
              </div>
            )}
            
            {/* Bidding Status */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Bidding Status</h3>
                {renderBiddingTimer()}
              </div>
              
              {highestBid ? (
                <div className="bg-green-50 p-4 rounded-lg mt-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-green-600">Current Highest Bid</p>
                      <p className="text-2xl font-bold text-green-700">
                        {formatCurrency(highestBid.amount)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-green-600">Team</p>
                      <p className="text-lg font-medium text-green-700">
                        {highestBid.teamName || `Team ${highestBid.teamId.substring(0, 5)}...`}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 p-4 rounded-lg mt-3">
                  <p className="text-center text-yellow-700">
                    No bids yet. Starting price is {formatCurrency(player.basePrice)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

PlayerDisplay.propTypes = {
  player: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string.isRequired,
    role: PropTypes.string,
    battingStyle: PropTypes.string,
    bowlingStyle: PropTypes.string,
    basePrice: PropTypes.number,
    image: PropTypes.string,
    stats: PropTypes.object
  }).isRequired,
  highestBid: PropTypes.shape({
    id: PropTypes.string,
    teamId: PropTypes.string,
    teamName: PropTypes.string,
    amount: PropTypes.number,
    timestamp: PropTypes.any
  })
};

export default PlayerDisplay;