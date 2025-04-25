// src/components/players/PlayerCard.js
import React from 'react';

const PlayerCard = ({ player, onClick, selected = false }) => {
  // Status badges
  const statusColors = {
    available: 'bg-blue-100 text-blue-800',
    sold: 'bg-green-100 text-green-800',
    unsold: 'bg-yellow-100 text-yellow-800',
    permanently_unsold: 'bg-red-100 text-red-800'
  };
  
  // Role badges
  const roleColors = {
    Batsman: 'bg-purple-100 text-purple-800',
    Bowler: 'bg-indigo-100 text-indigo-800',
    'All-rounder': 'bg-pink-100 text-pink-800',
    'Wicket-keeper': 'bg-cyan-100 text-cyan-800',
    default: 'bg-gray-100 text-gray-800'
  };
  
  return (
    <div 
      className={`bg-white rounded-lg shadow-md overflow-hidden 
        ${selected ? 'ring-2 ring-blue-500' : 'hover:shadow-lg'}
        transition-all cursor-pointer`}
      onClick={onClick}
    >
      <div className="relative">
        {/* Player Image */}
        {player.image ? (
          <img 
            src={player.image} 
            alt={player.name} 
            className="w-full h-48 object-cover object-center"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <span className="text-5xl font-bold text-gray-400">
              {player.name.charAt(0)}
            </span>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          <span className={`
            inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
            ${statusColors[player.status] || statusColors.available}
          `}>
            {player.status === 'permanently_unsold' ? 'Unsold' : 
              player.status.charAt(0).toUpperCase() + player.status.slice(1)}
          </span>
        </div>
        
        {/* Base Price Badge */}
        <div className="absolute bottom-2 right-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-white bg-opacity-90 text-gray-800">
            ${player.basePrice?.toLocaleString() || '1,000'}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
          {player.name}
        </h3>
        
        {/* Role Badge */}
        <div className="mb-3">
          <span className={`
            inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
            ${roleColors[player.role] || roleColors.default}
          `}>
            {player.role || 'Player'}
          </span>
        </div>
        
        {/* Player Stats */}
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
          <div>
            <span className="font-medium">Batting:</span>{' '}
            {player.battingStyle || 'N/A'}
          </div>
          <div>
            <span className="font-medium">Bowling:</span>{' '}
            {player.bowlingStyle || 'N/A'}
          </div>
        </div>
        
        {/* Sold information if player is sold */}
        {player.status === 'sold' && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Sold for:</span>
              <span className="font-bold text-green-600">${player.soldAmount?.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerCard;