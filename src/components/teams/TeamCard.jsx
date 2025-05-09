// src/components/teams/TeamCard.jsx
import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { formatIndianRupee } from '../../utils/currencyUtils';

const TeamCard = ({ team, onEdit }) => {
  if (!team) return null;
  
  // Helper to display team ownership details properly
  const displayOwners = () => {
    const owners = [team.owner1, team.owner2, team.owner3].filter(Boolean);
    if (owners.length === 0) return 'No owners specified';
    return owners.join(', ');
  };
  
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="p-4">
        {/* Team Header with Logo */}
        <div className="flex items-center mb-4">
          {team.logoUrl ? (
            <img 
              src={team.logoUrl} 
              alt={`${team.name} Logo`} 
              className="w-16 h-16 rounded-full mr-4 object-cover border border-gray-200"
              onClick={() => window.open(team.logoUrl, '_blank')}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3e%3crect x="3" y="3" width="18" height="18" rx="2" ry="2"%3e%3c/rect%3e%3ccircle cx="8.5" cy="8.5" r="1.5"%3e%3c/circle%3e%3cpolyline points="21 15 16 10 5 21"%3e%3c/polyline%3e%3c/svg%3e';
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
            <p className="text-gray-600">{displayOwners()}</p>
          </div>
        </div>

        {/* Team Details */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Wallet Balance:</span>
            <span className="font-bold text-green-600">{formatIndianRupee(team.wallet || 0)}</span>
          </div>
          
          {team.captain && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Team Captain:</span>
              <span className="font-bold text-gray-700">{team.captain}</span>
            </div>
          )}
          
          {team.womanCaptain && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Woman Captain:</span>
              <span className="font-bold text-gray-700">{team.womanCaptain}</span>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Players:</span>
            <span className="font-bold">{team.players ? team.players.length : 0}</span>
          </div>
        </div>
        
        {/* Edit Button */}
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onEdit && onEdit(team.id)}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            }
          >
            Edit Team
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default TeamCard;