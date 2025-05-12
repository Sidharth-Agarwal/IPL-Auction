// src/components/auction/BidControl.jsx
import React from 'react';
import Button from '../common/Button';
import { formatIndianRupee } from '../../utils/currencyUtils';

const BidControl = ({ 
  bidAmount, 
  onBidAmountChange, 
  teams, 
  selectedTeamId, 
  onTeamSelect 
}) => {
  const handleBidAmountChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      onBidAmountChange(value);
    }
  };
  
  const handleIncrementBid = (increment) => {
    onBidAmountChange(bidAmount + increment);
  };
  
  const handleTeamChange = (e) => {
    onTeamSelect(e.target.value);
  };

  // Function to render team logo with proper error handling
  const renderTeamLogo = (team) => {
    if (!team) return null;

    return team.logoUrl ? (
      <img 
        src={team.logoUrl} 
        alt={team.name} 
        className="w-6 h-6 rounded-full mr-2"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = 'data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3e%3crect x="3" y="3" width="18" height="18" rx="2" ry="2"%3e%3c/rect%3e%3ccircle cx="8.5" cy="8.5" r="1.5"%3e%3c/circle%3e%3cpolyline points="21 15 16 10 5 21"%3e%3c/polyline%3e%3c/svg%3e';
        }}
      />
    ) : (
      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
        <span className="text-xs font-bold text-blue-700">
          {team.name.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  };
  
  return (
    <div className="space-y-3 bg-white p-3 rounded-lg border border-gray-200">
      <h3 className="text-sm font-medium text-gray-900">Bidding Controls</h3>
      
      {/* Bid Amount Input */}
      <div>
        <label htmlFor="bidAmount" className="block text-xs font-medium text-gray-700 mb-1">
          Final Bid Amount
        </label>
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">₹</span>
          </div>
          <input
            type="number"
            name="bidAmount"
            id="bidAmount"
            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
            placeholder="0"
            value={bidAmount}
            onChange={handleBidAmountChange}
            min="0"
          />
        </div>
      </div>
      
      {/* Quick Increment Buttons */}
      <div className="grid grid-cols-4 gap-2">
        <Button
          variant="outline"
          size="xs"
          onClick={() => handleIncrementBid(100)}
        >
          +100
        </Button>
        <Button
          variant="outline"
          size="xs"
          onClick={() => handleIncrementBid(500)}
        >
          +500
        </Button>
        <Button
          variant="outline"
          size="xs"
          onClick={() => handleIncrementBid(1000)}
        >
          +1000
        </Button>
        <Button
          variant="outline"
          size="xs"
          onClick={() => handleIncrementBid(5000)}
        >
          +5000
        </Button>
      </div>
      
      {/* Team Selection */}
      <div>
        <label htmlFor="teamSelect" className="block text-xs font-medium text-gray-700 mb-1">
          Winning Team
        </label>
        <select
          id="teamSelect"
          name="teamSelect"
          className="mt-1 block w-full pl-3 pr-10 py-1.5 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          value={selectedTeamId}
          onChange={handleTeamChange}
        >
          <option value="">Select a team</option>
          {teams.map(team => (
            <option key={team.id} value={team.id}>
              {team.name} ({formatIndianRupee(team.wallet || 0)})
            </option>
          ))}
        </select>
        
        {/* Show selected team */}
        {selectedTeamId && (
          <div className="mt-2 bg-blue-50 p-1.5 rounded-md">
            <div className="flex items-center">
              {renderTeamLogo(teams.find(t => t.id === selectedTeamId))}
              <div>
                <p className="text-xs font-medium">{teams.find(t => t.id === selectedTeamId)?.name || 'Team'}</p>
                <p className="text-xs text-blue-600">
                  Wallet: {formatIndianRupee(teams.find(t => t.id === selectedTeamId)?.wallet || 0)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BidControl;