// src/components/auction/PlayerDisplay.js
import React from 'react';
import Card from '../common/Card';

const PlayerDisplay = ({ player, highestBid }) => {
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
  
  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold">{player.name}</h2>
        {highestBid ? (
          <div className="text-right">
            <p className="text-sm text-blue-200">Current Highest Bid</p>
            <p className="text-2xl font-bold">${highestBid.amount.toLocaleString()}</p>
          </div>
        ) : (
          <div className="text-right">
            <p className="text-sm text-blue-200">Base Price</p>
            <p className="text-xl font-bold">${player.basePrice.toLocaleString()}</p>
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
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-6xl font-bold text-gray-400">
                    {player.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            
            <div className="space-y-2 mb-4">
              {/* Role */}
              <div className="flex justify-between">
                <span className="text-gray-600">Role:</span>
                <span className="font-medium">{player.role || 'N/A'}</span>
              </div>
              
              {/* Batting Style */}
              <div className="flex justify-between">
                <span className="text-gray-600">Batting:</span>
                <span className="font-medium">{player.battingStyle || 'N/A'}</span>
              </div>
              
              {/* Bowling Style */}
              <div className="flex justify-between">
                <span className="text-gray-600">Bowling:</span>
                <span className="font-medium">{player.bowlingStyle || 'N/A'}</span>
              </div>
            </div>
            
            {/* Status Badge */}
            <div className="mt-4">
              <div className="inline-flex rounded-full px-3 py-1 text-sm font-semibold bg-blue-100 text-blue-800">
                Base Price: ${player.basePrice.toLocaleString()}
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
              <h3 className="text-lg font-semibold mb-3">Bidding Status</h3>
              
              {highestBid ? (
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-green-600">Current Highest Bid</p>
                      <p className="text-2xl font-bold text-green-700">
                        ${highestBid.amount.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-green-600">Team</p>
                      <p className="text-lg font-medium text-green-700">
                        {/* Ideally, we would show the team name here */}
                        Team {highestBid.teamId.substring(0, 5)}...
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-center text-yellow-700">
                    No bids yet. Starting price is ${player.basePrice.toLocaleString()}
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

export default PlayerDisplay;