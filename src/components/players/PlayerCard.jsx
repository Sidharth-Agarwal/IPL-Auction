// src/components/players/PlayerCard.jsx
import React from 'react';
import Card from '../common/Card';

const PlayerCard = ({ player, onClick }) => {
  if (!player) return null;
  
  const formatCurrency = (amount) => {
    return `$${amount.toLocaleString()}`;
  };
  
  const getStatusStyles = (status) => {
    switch (status) {
      case 'sold':
        return 'bg-green-100 text-green-800';
      case 'unsold':
        return 'bg-red-100 text-red-800';
      case 'available':
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };
  
  return (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onClick && onClick(player)}
    >
      <div className="p-4">
        {/* Player Header with Photo */}
        <div className="flex items-center mb-4">
          {player.image ? (
            <img 
              src={player.image} 
              alt={`${player.name}`} 
              className="w-16 h-16 rounded-full mr-4 object-cover border border-gray-200"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3e%3crect x="3" y="3" width="18" height="18" rx="2" ry="2"%3e%3c/rect%3e%3ccircle cx="8.5" cy="8.5" r="1.5"%3e%3c/circle%3e%3cpolyline points="21 15 16 10 5 21"%3e%3c/polyline%3e%3c/svg%3e';
              }}
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mr-4 border border-blue-200">
              <span className="text-2xl font-bold text-blue-700">
                {player.name.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <h3 className="text-xl font-bold text-gray-900">{player.name}</h3>
            <p className="text-gray-600">{player.role || 'Player'}</p>
          </div>
        </div>

        {/* Player Details */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Base Price:</span>
            <span className="font-bold text-green-600">{formatCurrency(player.basePrice || 0)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Status:</span>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyles(player.status)}`}>
              {player.status || 'available'}
            </span>
          </div>
          
          {player.soldTo && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Sold To:</span>
              <span className="font-bold">{player.soldToTeam || player.soldTo}</span>
            </div>
          )}
          
          {player.soldAmount > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Sold For:</span>
              <span className="font-bold text-green-600">{formatCurrency(player.soldAmount)}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default PlayerCard;