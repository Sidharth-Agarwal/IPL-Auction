// src/components/auction/BidControl.jsx
import React from 'react';
import Button from '../common/Button';

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
  
  const formatCurrency = (amount) => {
    return `$${amount.toLocaleString()}`;
  };
  
  return (
    <div className="space-y-4 bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900">Bidding Controls</h3>
      
      {/* Bid Amount Input */}
      <div>
        <label htmlFor="bidAmount" className="block text-sm font-medium text-gray-700 mb-1">
          Final Bid Amount
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">$</span>
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
          size="sm"
          onClick={() => handleIncrementBid(100)}
        >
          +100
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleIncrementBid(500)}
        >
          +500
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleIncrementBid(1000)}
        >
          +1000
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleIncrementBid(5000)}
        >
          +5000
        </Button>
      </div>
      
      {/* Team Selection */}
      <div>
        <label htmlFor="teamSelect" className="block text-sm font-medium text-gray-700 mb-1">
          Winning Team
        </label>
        <select
          id="teamSelect"
          name="teamSelect"
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          value={selectedTeamId}
          onChange={handleTeamChange}
        >
          <option value="">Select a team</option>
          {teams.map(team => (
            <option key={team.id} value={team.id}>
              {team.name} ({formatCurrency(team.wallet || 0)})
            </option>
          ))}
        </select>
        
        {/* Show selected team */}
        {selectedTeamId && (
          <div className="mt-2 bg-blue-50 p-2 rounded-md">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                <span className="text-sm font-bold text-blue-700">
                  {teams.find(t => t.id === selectedTeamId)?.name.charAt(0) || 'T'}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium">{teams.find(t => t.id === selectedTeamId)?.name || 'Team'}</p>
                <p className="text-xs text-blue-600">
                  Wallet: {formatCurrency(teams.find(t => t.id === selectedTeamId)?.wallet || 0)}
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