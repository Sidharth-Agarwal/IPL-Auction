// src/components/teams/TeamCard.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { formatCurrency } from '../../utils/formatters';
import Button from '../common/Button';

const TeamCard = ({ 
  team, 
  onClick, 
  onViewDetails, 
  onSelectTeam, 
  className = '',
  showActions = true
}) => {
  if (!team) return null;
  
  const handleClick = () => {
    if (onClick) onClick(team);
  };
  
  const handleViewDetails = (e) => {
    e.stopPropagation(); // Prevent card click
    if (onViewDetails) onViewDetails(team);
  };
  
  const handleSelectTeam = (e) => {
    e.stopPropagation(); // Prevent card click
    if (onSelectTeam) onSelectTeam(team);
  };
  
  return (
    <div 
      className={`bg-white rounded-lg shadow-md overflow-hidden ${onClick ? 'cursor-pointer hover:shadow-lg' : ''} transition-all ${className}`}
      onClick={onClick ? handleClick : undefined}
    >
      <div className="p-4">
        <div className="flex items-center mb-4">
          {team.logo ? (
            <img 
              src={team.logo} 
              alt={`${team.name} Logo`} 
              className="w-16 h-16 rounded-full mr-4 object-cover border border-gray-200"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/assets/images/team-placeholder.png';
              }}
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mr-4 border border-blue-200">
              <span className="text-2xl font-bold text-blue-700">
                {team.name.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <h3 className="text-xl font-bold text-gray-900">{team.name}</h3>
            <p className="text-gray-600">{team.owner || 'No owner specified'}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Wallet Balance:</span>
            <span className="font-bold text-green-600">{formatCurrency(team.wallet)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Players:</span>
            <span className="font-bold">{team.players ? team.players.length : 0}</span>
          </div>
          
          {team.initialWallet && team.wallet < team.initialWallet && (
            <div className="flex justify-between">
              <span className="text-gray-600">Total Spent:</span>
              <span className="font-bold text-blue-600">
                {formatCurrency(team.initialWallet - team.wallet)}
              </span>
            </div>
          )}
        </div>

        {showActions && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col sm:flex-row gap-2">
            {onViewDetails && (
              <Button 
                variant="outline"
                onClick={handleViewDetails}
                fullWidth
                size="sm"
              >
                View Details
              </Button>
            )}
            
            {onSelectTeam && (
              <Button 
                variant="primary" 
                onClick={handleSelectTeam}
                fullWidth
                size="sm"
              >
                Select Team
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

TeamCard.propTypes = {
  team: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string.isRequired,
    owner: PropTypes.string,
    wallet: PropTypes.number,
    initialWallet: PropTypes.number,
    logo: PropTypes.string,
    players: PropTypes.array
  }).isRequired,
  onClick: PropTypes.func,
  onViewDetails: PropTypes.func,
  onSelectTeam: PropTypes.func,
  className: PropTypes.string,
  showActions: PropTypes.bool
};

export default TeamCard;