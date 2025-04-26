// src/components/players/PlayerCard.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { formatCurrency } from '../../utils/formatters';
import { PLAYER_STATUS, PLAYER_ROLES, ROLE_COLORS, STATUS_COLORS } from '../../utils/constants';

const PlayerCard = ({ 
  player, 
  onClick, 
  selected = false, 
  showDetails = false,
  className = ''
}) => {
  if (!player) return null;
  
  // Get colors for status and role
  const statusColor = STATUS_COLORS[player.status] || STATUS_COLORS[PLAYER_STATUS.AVAILABLE];
  const roleColor = ROLE_COLORS[player.role] || ROLE_COLORS.default;
  
  return (
    <div 
      className={`bg-white rounded-lg shadow-md overflow-hidden 
        ${selected ? 'ring-2 ring-blue-500' : 'hover:shadow-lg'}
        transition-all ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick ? () => onClick(player) : undefined}
    >
      <div className="relative">
        {/* Player Image */}
        {player.image ? (
          <div className="aspect-w-1 aspect-h-1 max-h-48">
            <img 
              src={player.image} 
              alt={player.name} 
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/assets/images/player-placeholder.png';
              }}
            />
          </div>
        ) : (
          <div className="aspect-w-1 aspect-h-1 bg-gray-200 flex items-center justify-center max-h-48">
            <span className="text-5xl font-bold text-gray-400">
              {player.name?.charAt(0).toUpperCase() || 'P'}
            </span>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          <span className={`
            inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
            ${statusColor.bg} ${statusColor.text}
          `}>
            {player.status === PLAYER_STATUS.PERMANENTLY_UNSOLD ? 'Unsold' : 
              player.status?.charAt(0).toUpperCase() + player.status?.slice(1) || 'Available'}
          </span>
        </div>
        
        {/* Base Price Badge */}
        <div className="absolute bottom-2 right-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-white bg-opacity-90 text-gray-800">
            {formatCurrency(player.basePrice || 1000)}
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
            ${roleColor.bg} ${roleColor.text}
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
        {player.status === PLAYER_STATUS.SOLD && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Sold for:</span>
              <span className="font-bold text-green-600">{formatCurrency(player.soldAmount || 0)}</span>
            </div>
          </div>
        )}
        
        {/* Extra details section */}
        {showDetails && player.stats && Object.keys(player.stats).length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Player Statistics</h4>
            <div className="grid grid-cols-2 gap-2">
              {player.stats.matches && (
                <div className="text-xs">
                  <span className="font-medium">Matches:</span> {player.stats.matches}
                </div>
              )}
              {player.stats.runs && (
                <div className="text-xs">
                  <span className="font-medium">Runs:</span> {player.stats.runs}
                </div>
              )}
              {player.stats.wickets && (
                <div className="text-xs">
                  <span className="font-medium">Wickets:</span> {player.stats.wickets}
                </div>
              )}
              {player.stats.average && (
                <div className="text-xs">
                  <span className="font-medium">Average:</span> {player.stats.average}
                </div>
              )}
              {player.stats.strikeRate && (
                <div className="text-xs">
                  <span className="font-medium">Strike Rate:</span> {player.stats.strikeRate}
                </div>
              )}
              {player.stats.economy && (
                <div className="text-xs">
                  <span className="font-medium">Economy:</span> {player.stats.economy}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

PlayerCard.propTypes = {
  player: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string.isRequired,
    role: PropTypes.string,
    battingStyle: PropTypes.string,
    bowlingStyle: PropTypes.string,
    basePrice: PropTypes.number,
    status: PropTypes.string,
    soldTo: PropTypes.string,
    soldAmount: PropTypes.number,
    image: PropTypes.string,
    stats: PropTypes.object
  }).isRequired,
  onClick: PropTypes.func,
  selected: PropTypes.bool,
  showDetails: PropTypes.bool,
  className: PropTypes.string
};

export default PlayerCard;