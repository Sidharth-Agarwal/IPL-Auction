// src/components/auction/TeamDashboard.jsx
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import Card from '../common/Card';
import { formatCurrency } from '../../utils/formatters';

const TeamDashboard = ({ team, highestBid, currentPlayer }) => {
  // Calculate wallet after potential win
  const potentialWalletAfterWin = useMemo(() => {
    const isHighestBidder = highestBid && highestBid.teamId === team.id;
    
    if (isHighestBidder) {
      return team.wallet - highestBid.amount;
    }
    return team.wallet;
  }, [team, highestBid]);

  // Calculate if team can afford next minimum bid
  const canAffordNextBid = useMemo(() => {
    if (!currentPlayer || !team) return false;
    
    // If no bids yet, check if team can afford base price
    if (!highestBid) {
      return team.wallet >= currentPlayer.basePrice;
    }
    
    // If team is highest bidder, they don't need to bid again
    if (highestBid.teamId === team.id) {
      return true;
    }
    
    // Check if team can afford minimum increment
    const minIncrement = 100; // Should come from settings
    const nextMinBid = highestBid.amount + minIncrement;
    return team.wallet >= nextMinBid;
  }, [team, highestBid, currentPlayer]);

  // Calculate team statistics
  const teamStats = useMemo(() => {
    if (!team) return {};
    
    // If players is undefined or null, use empty array
    const players = team.players || [];
    
    // Remaining wallet as percentage
    const initialWallet = team.initialWallet || 10000; // default if not specified
    const remainingPercentage = ((team.wallet / initialWallet) * 100).toFixed(0);
    
    return {
      playerCount: players.length,
      maxBid: team.wallet,
      remainingPercentage
    };
  }, [team]);

  if (!team) return null;

  return (
    <Card title="Your Team Dashboard">
      <div className="space-y-4 p-4">
        {/* Team Info */}
        <div className="flex items-center">
          {team.logo ? (
            <img 
              src={team.logo} 
              alt={`${team.name} Logo`} 
              className="w-12 h-12 rounded-full mr-4 object-cover border border-gray-200"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/assets/images/team-placeholder.png';
              }}
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4 border border-blue-200">
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
        <div className="relative pt-1">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block text-blue-600">
                Wallet Balance
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-blue-600">
                {teamStats.remainingPercentage}%
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-1 text-xs flex rounded bg-blue-200">
            <div 
              style={{ width: `${teamStats.remainingPercentage}%` }} 
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>0</span>
            <span>{formatCurrency(team.initialWallet || 10000)}</span>
          </div>
        </div>
        
        {/* Current Wallet */}
        <div className="bg-gray-50 rounded-md p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Available Balance</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(team.wallet)}</p>
            </div>
            
            {highestBid && highestBid.teamId === team.id && (
              <div className="text-right">
                <p className="text-sm text-gray-500">If You Win</p>
                <p className="text-lg font-bold text-yellow-600">{formatCurrency(potentialWalletAfterWin)}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Bidding Status */}
        {currentPlayer && (
          <>
            {highestBid && highestBid.teamId === team.id ? (
              <div className="bg-green-50 rounded-md p-3 text-center">
                <p className="text-sm text-green-800 font-medium">You are the highest bidder!</p>
                <p className="text-lg font-bold text-green-700">{formatCurrency(highestBid.amount)}</p>
              </div>
            ) : highestBid ? (
              <div className={`rounded-md p-3 text-center ${canAffordNextBid ? 'bg-yellow-50' : 'bg-red-50'}`}>
                <p className={`text-sm font-medium ${canAffordNextBid ? 'text-yellow-800' : 'text-red-800'}`}>
                  {canAffordNextBid 
                    ? 'Current highest bid by another team' 
                    : 'You cannot afford the next minimum bid'}
                </p>
                <p className={`text-lg font-bold ${canAffordNextBid ? 'text-yellow-700' : 'text-red-700'}`}>
                  {formatCurrency(highestBid.amount)}
                </p>
              </div>
            ) : (
              <div className={`rounded-md p-3 text-center ${canAffordNextBid ? 'bg-blue-50' : 'bg-red-50'}`}>
                <p className={`text-sm font-medium ${canAffordNextBid ? 'text-blue-800' : 'text-red-800'}`}>
                  {canAffordNextBid 
                    ? 'No bids yet - you can start bidding!' 
                    : 'You cannot afford the base price'}
                </p>
                <p className={`text-lg font-bold ${canAffordNextBid ? 'text-blue-700' : 'text-red-700'}`}>
                  {formatCurrency(currentPlayer.basePrice)}
                </p>
              </div>
            )}
          </>
        )}
        
        {/* Team Stats */}
        <div className="pt-3 mt-1 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Team Stats</h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-blue-50 p-2 rounded-md text-center">
              <p className="text-xs text-blue-500">Players</p>
              <p className="text-lg font-bold text-blue-700">{teamStats.playerCount}</p>
            </div>
            
            <div className="bg-purple-50 p-2 rounded-md text-center">
              <p className="text-xs text-purple-500">Max Bid</p>
              <p className="text-lg font-bold text-purple-700">
                {formatCurrency(teamStats.maxBid)}
              </p>
            </div>
            
            <div className="bg-indigo-50 p-2 rounded-md text-center">
              <p className="text-xs text-indigo-500">Auction</p>
              <p className="text-lg font-bold text-indigo-700">Live</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

TeamDashboard.propTypes = {
  team: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string.isRequired,
    owner: PropTypes.string,
    wallet: PropTypes.number,
    initialWallet: PropTypes.number,
    logo: PropTypes.string,
    players: PropTypes.array
  }).isRequired,
  highestBid: PropTypes.shape({
    id: PropTypes.string,
    teamId: PropTypes.string,
    amount: PropTypes.number,
    timestamp: PropTypes.any
  }),
  currentPlayer: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    basePrice: PropTypes.number
  })
};

export default TeamDashboard;