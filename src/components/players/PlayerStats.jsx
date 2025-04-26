// src/components/players/PlayerStats.jsx
import React from 'react';
import PropTypes from 'prop-types';
import Card from '../common/Card';
import { formatPlayerStats } from '../../utils/formatters';
import { ROLE_COLORS } from '../../utils/constants';

const PlayerStats = ({ player, className = '' }) => {
  if (!player) return null;
  
  // Get colors for role
  const roleColor = ROLE_COLORS[player.role] || ROLE_COLORS.default;
  
  // Format the stats for display
  const formattedStats = formatPlayerStats(player.stats);
  const hasStats = formattedStats.length > 0;
  
  // Group stats based on player role
  const battingStats = ['matches', 'runs', 'average', 'strikeRate', 'centuries', 'fifties'];
  const bowlingStats = ['matches', 'wickets', 'economy', 'average'];
  
  const renderStatItem = (label, value, highlighted = false) => (
    <div className={`text-center p-3 rounded-lg ${highlighted ? 'bg-blue-50' : 'bg-gray-50'}`}>
      <p className={`text-sm font-medium ${highlighted ? 'text-blue-700' : 'text-gray-600'}`}>{label}</p>
      <p className={`text-xl font-bold ${highlighted ? 'text-blue-900' : 'text-gray-900'}`}>{value || '0'}</p>
    </div>
  );

  return (
    <Card 
      title="Player Statistics"
      className={`${className} overflow-hidden`}
    >
      <div className="p-4 space-y-6">
        {/* Player Basic Info */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-shrink-0">
            {player.image ? (
              <img 
                src={player.image} 
                alt={player.name} 
                className="w-24 h-24 rounded-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/assets/images/player-placeholder.png';
                }}
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-4xl font-bold text-gray-400">
                  {player.name?.charAt(0).toUpperCase() || 'P'}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{player.name}</h2>
            <div className="flex flex-wrap gap-2 mt-2">
              {player.role && (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${roleColor.bg} ${roleColor.text}`}>
                  {player.role}
                </span>
              )}
              {player.battingStyle && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  Batting: {player.battingStyle}
                </span>
              )}
              {player.bowlingStyle && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                  Bowling: {player.bowlingStyle}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Divider */}
        <div className="border-t border-gray-200"></div>
        
        {/* Stats Section */}
        {hasStats ? (
          <div className="space-y-6">
            {/* Career Overview */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Career Overview</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {renderStatItem('Matches', player.stats?.matches, true)}
                {player.stats?.runs && renderStatItem('Runs', player.stats.runs, true)}
                {player.stats?.wickets && renderStatItem('Wickets', player.stats.wickets, true)}
                {player.stats?.average && renderStatItem('Average', player.stats.average, true)}
              </div>
            </div>
            
            {/* Batting Stats */}
            {player.role !== 'Bowler' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Batting Statistics</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {player.stats?.runs && renderStatItem('Runs', player.stats.runs)}
                  {player.stats?.average && renderStatItem('Average', player.stats.average)}
                  {player.stats?.strikeRate && renderStatItem('Strike Rate', player.stats.strikeRate)}
                  {player.stats?.centuries && renderStatItem('Centuries', player.stats.centuries)}
                  {player.stats?.fifties && renderStatItem('Fifties', player.stats.fifties)}
                </div>
              </div>
            )}
            
            {/* Bowling Stats */}
            {player.role !== 'Batsman' && player.role !== 'Wicket-keeper' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Bowling Statistics</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {player.stats?.wickets && renderStatItem('Wickets', player.stats.wickets)}
                  {player.stats?.economy && renderStatItem('Economy', player.stats.economy)}
                  {player.stats?.average && renderStatItem('Bowling Avg', player.stats.average)}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-gray-500">No statistics available for this player</p>
          </div>
        )}
      </div>
    </Card>
  );
};

PlayerStats.propTypes = {
  player: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string.isRequired,
    role: PropTypes.string,
    battingStyle: PropTypes.string,
    bowlingStyle: PropTypes.string,
    image: PropTypes.string,
    stats: PropTypes.object
  }).isRequired,
  className: PropTypes.string
};

export default PlayerStats;