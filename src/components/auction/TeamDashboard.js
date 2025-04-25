// src/components/auction/TeamDashboard.js
import React from 'react';
import Card from '../common/Card';

const TeamDashboard = ({ team, highestBid }) => {
  // Check if this team is the current highest bidder
  const isHighestBidder = highestBid && highestBid.teamId === team.id;
  
  // Calculate wallet after potential win
  const potentialWalletAfterWin = isHighestBidder 
    ? team.wallet - highestBid.amount 
    : team.wallet;
  
  return (
    <Card title="Your Team Dashboard">
      <div className="space-y-4">
        {/* Team Info */}
        <div className="flex items-center">
          {team.logo ? (
            <img 
              src={team.logo} 
              alt={`${team.name} Logo`} 
              className="w-12 h-12 rounded-full mr-4 object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
              <span className="text-xl font-bold text-blue-700">
                {team.name.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <h3 className="text-lg font-bold text-gray-900">{team.name}</h3>
            <p className="text-sm text-gray-500">{team.owner || 'No owner specified'}</p>
          </div>
        </div>
        
        {/* Wallet Status */}
        <div className="bg-gray-50 rounded-md p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Available Balance</p>
              <p className="text-2xl font-bold text-green-600">${team.wallet.toLocaleString()}</p>
            </div>
            
            {isHighestBidder && (
              <div className="text-right">
                <p className="text-sm text-gray-500">If You Win</p>
                <p className="text-lg font-bold text-yellow-600">${potentialWalletAfterWin.toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Current Bid Status */}
        {isHighestBidder ? (
          <div className="bg-green-50 rounded-md p-4 text-center">
            <p className="text-sm text-green-800 mb-1">You are the highest bidder!</p>
            <p className="text-lg font-bold text-green-800">${highestBid.amount.toLocaleString()}</p>
          </div>
        ) : highestBid ? (
          <div className="bg-yellow-50 rounded-md p-4 text-center">
            <p className="text-sm text-yellow-800 mb-1">Current highest bid</p>
            <p className="text-lg font-bold text-yellow-800">${highestBid.amount.toLocaleString()}</p>
          </div>
        ) : null}
        
        {/* Team Stats */}
        <div className="pt-3 mt-3 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Team Stats</h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-blue-50 p-2 rounded-md text-center">
              <p className="text-xs text-blue-500">Players</p>
              <p className="text-lg font-bold text-blue-700">{team.players ? team.players.length : 0}</p>
            </div>
            
            <div className="bg-purple-50 p-2 rounded-md text-center">
              <p className="text-xs text-purple-500">Bids Won</p>
              <p className="text-lg font-bold text-purple-700">
                {team.players ? team.players.length : 0}
              </p>
            </div>
            
            <div className="bg-indigo-50 p-2 rounded-md text-center">
              <p className="text-xs text-indigo-500">Avg. Spent</p>
              <p className="text-lg font-bold text-indigo-700">
                {team.players && team.players.length > 0 
                  ? `$${Math.round((team.initialWallet || 10000) - team.wallet) / team.players.length}` 
                  : '$0'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TeamDashboard;