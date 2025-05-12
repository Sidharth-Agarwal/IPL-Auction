// src/components/auction/PlayerDisplay.jsx
import React from 'react';
import Card from '../common/Card';
import { formatIndianRupee } from '../../utils/currencyUtils';

// This is a simplified version that can be used if player details need
// to be displayed in a standalone way outside of the auction controls
const PlayerDisplay = ({ player }) => {
  if (!player) return null;

  // Enhanced image rendering with proper error handling
  const renderPlayerImage = () => {
    if (!player.imageUrl) {
      return (
        <div className="w-32 h-32 rounded-lg bg-blue-100 flex items-center justify-center mb-2 border border-blue-200">
          <span className="text-5xl font-bold text-blue-700">
            {player.name.charAt(0).toUpperCase()}
          </span>
        </div>
      );
    }

    return (
      <img 
        src={player.imageUrl} 
        alt={player.name} 
        className="w-32 h-32 rounded-lg object-cover mb-2 border border-gray-200"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = 'data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3e%3crect x="3" y="3" width="18" height="18" rx="2" ry="2"%3e%3c/rect%3e%3ccircle cx="8.5" cy="8.5" r="1.5"%3e%3c/circle%3e%3cpolyline points="21 15 16 10 5 21"%3e%3c/polyline%3e%3c/svg%3e';
        }}
      />
    );
  };
  
  return (
    <Card title="Player Details">
      <div className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Left: Player Image and Badges */}
          <div className="md:w-1/3 flex flex-col items-center">
            {renderPlayerImage()}
            
            {/* Player Badges */}
            <div className="text-center mb-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {player.playerType || 'Player'}
              </span>
              {player.isCapped && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-1">
                  {player.isCapped === 'capped' ? 'Capped' : 'Uncapped'}
                </span>
              )}
              
              {/* Gender Badge */}
              {player.gender && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ml-1 ${
                  player.gender === 'female' ? 'bg-pink-100 text-pink-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {player.gender === 'female' ? 'Female' : 'Male'}
                </span>
              )}
            </div>
            
            {/* Base Price */}
            <div className="bg-gray-50 px-3 py-2 rounded-lg w-full text-center">
              <p className="text-xs text-gray-500">Base Price</p>
              <p className="text-lg font-bold text-green-600">{formatIndianRupee(player.basePrice || 1000)}</p>
            </div>
          </div>
          
          {/* Right: Player Details and Stats */}
          <div className="md:w-2/3">
            <h2 className="text-lg font-bold text-gray-900 mb-2">{player.name}</h2>
            
            {/* Player Attributes in compact grid */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              {player.specialization && (
                <div>
                  <span className="text-xs text-gray-500">Specialization:</span>
                  <p className="text-sm font-medium">{player.specialization}</p>
                </div>
              )}
              
              {player.battingStyle && (
                <div>
                  <span className="text-xs text-gray-500">Batting Style:</span>
                  <p className="text-sm font-medium">{player.battingStyle}</p>
                </div>
              )}
              
              {player.ballingType && (
                <div>
                  <span className="text-xs text-gray-500">Bowling Type:</span>
                  <p className="text-sm font-medium">{player.ballingType}</p>
                </div>
              )}
              
              {player.nationality && (
                <div>
                  <span className="text-xs text-gray-500">Nationality:</span>
                  <p className="text-sm font-medium">{player.nationality}</p>
                </div>
              )}
              
              {player.age && (
                <div>
                  <span className="text-xs text-gray-500">Age:</span>
                  <p className="text-sm font-medium">{player.age}</p>
                </div>
              )}
            </div>
            
            {/* Player Statistics in compact grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Batting Stats */}
              <div>
                <h4 className="text-xs font-medium text-blue-600 mb-1">Batting</h4>
                <div className="grid grid-cols-2 gap-1 text-center">
                  <div className="bg-blue-50 p-1 rounded">
                    <p className="text-xs text-gray-500">Innings</p>
                    <p className="text-sm font-bold">{player.battingInnings || 0}</p>
                  </div>
                  <div className="bg-blue-50 p-1 rounded">
                    <p className="text-xs text-gray-500">Runs</p>
                    <p className="text-sm font-bold">{player.runs || 0}</p>
                  </div>
                  <div className="bg-blue-50 p-1 rounded">
                    <p className="text-xs text-gray-500">Average</p>
                    <p className="text-sm font-bold">{player.battingAverage?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div className="bg-blue-50 p-1 rounded">
                    <p className="text-xs text-gray-500">SR</p>
                    <p className="text-sm font-bold">{player.strikeRate?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>
              </div>
              
              {/* Bowling Stats */}
              <div>
                <h4 className="text-xs font-medium text-green-600 mb-1">Bowling</h4>
                <div className="grid grid-cols-2 gap-1 text-center">
                  <div className="bg-green-50 p-1 rounded">
                    <p className="text-xs text-gray-500">Innings</p>
                    <p className="text-sm font-bold">{player.ballingInnings || 0}</p>
                  </div>
                  <div className="bg-green-50 p-1 rounded">
                    <p className="text-xs text-gray-500">Wickets</p>
                    <p className="text-sm font-bold">{player.wickets || 0}</p>
                  </div>
                  <div className="bg-green-50 p-1 rounded">
                    <p className="text-xs text-gray-500">Average</p>
                    <p className="text-sm font-bold">{player.ballingAverage?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div className="bg-green-50 p-1 rounded">
                    <p className="text-xs text-gray-500">Economy</p>
                    <p className="text-sm font-bold">{player.economy?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Auction Result (if sold) */}
            {player.status === 'sold' && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="bg-green-50 p-2 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-green-600">Sold To</p>
                      <p className="text-sm font-bold">{player.soldToTeam || 'Team'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-green-600">Sold For</p>
                      <p className="text-sm font-bold">{formatIndianRupee(player.soldAmount || 0)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PlayerDisplay;