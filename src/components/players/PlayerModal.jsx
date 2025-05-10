// src/components/players/PlayerModal.jsx
import React from 'react';
import Modal from '../common/Modal';
import { formatIndianRupee } from '../../utils/currencyUtils';

const PlayerModal = ({ player, isOpen, onClose }) => {
  if (!player) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={player.name}
      size="lg"
    >
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Player Image and Basic Info */}
          <div className="md:col-span-1">
            <div className="flex flex-col items-center">
              {player.imageUrl ? (
                <img 
                  src={player.imageUrl} 
                  alt={player.name} 
                  className="w-40 h-40 rounded-lg object-cover mb-4 border border-gray-200"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3e%3crect x="3" y="3" width="18" height="18" rx="2" ry="2"%3e%3c/rect%3e%3ccircle cx="8.5" cy="8.5" r="1.5"%3e%3c/circle%3e%3cpolyline points="21 15 16 10 5 21"%3e%3c/polyline%3e%3c/svg%3e';
                  }}
                />
              ) : (
                <div className="w-40 h-40 rounded-lg bg-blue-100 flex items-center justify-center mb-4 border border-blue-200">
                  <span className="text-6xl font-bold text-blue-700">
                    {player.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              
              <div className="text-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-2">
                  {player.playerType || 'Player'}
                </span>
                {player.isCapped && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-1">
                    {player.isCapped === 'capped' ? 'Capped' : 'Uncapped'}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Player Details */}
          <div className="md:col-span-2">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Base Price</p>
                <p className="text-xl font-bold text-green-600">{formatIndianRupee(player.basePrice || 1000)}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Status</p>
                <p className="text-xl font-bold">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    player.status === 'sold' ? 'bg-green-100 text-green-800' : 
                    player.status === 'unsold' ? 'bg-red-100 text-red-800' : 
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {player.status || 'Available'}
                  </span>
                </p>
              </div>
            </div>
            
            {/* Player Attributes */}
            <div className="space-y-4">
              {/* Gender */}
              <div className="flex justify-between">
                <span className="text-gray-500">Gender:</span>
                <span className={`font-medium px-2.5 py-0.5 rounded-full text-xs capitalize ${
                  player.gender === 'female' ? 'bg-pink-100 text-pink-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {player.gender || 'Male'}
                </span>
              </div>
              
              {player.specialization && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Specialization:</span>
                  <span className="font-medium">{player.specialization}</span>
                </div>
              )}
              
              {player.battingStyle && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Batting Style:</span>
                  <span className="font-medium">{player.battingStyle}</span>
                </div>
              )}
              
              {player.ballingType && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Bowling Type:</span>
                  <span className="font-medium">{player.ballingType}</span>
                </div>
              )}
              
              {player.nationality && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Nationality:</span>
                  <span className="font-medium">{player.nationality}</span>
                </div>
              )}
              
              {player.age && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Age:</span>
                  <span className="font-medium">{player.age}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Player Statistics */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-md font-medium text-gray-700 mb-4">Player Statistics</h3>
          
          {/* Batting Stats */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-blue-600 mb-2">Batting</h4>
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-blue-50 p-2 rounded text-center">
                <p className="text-xs text-gray-500">Innings</p>
                <p className="font-bold">{player.battingInnings || 0}</p>
              </div>
              <div className="bg-blue-50 p-2 rounded text-center">
                <p className="text-xs text-gray-500">Runs</p>
                <p className="font-bold">{player.runs || 0}</p>
              </div>
              <div className="bg-blue-50 p-2 rounded text-center">
                <p className="text-xs text-gray-500">Average</p>
                <p className="font-bold">{player.battingAverage?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="bg-blue-50 p-2 rounded text-center">
                <p className="text-xs text-gray-500">Strike Rate</p>
                <p className="font-bold">{player.strikeRate?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </div>
          
          {/* Bowling Stats */}
          <div>
            <h4 className="text-sm font-medium text-green-600 mb-2">Bowling</h4>
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-green-50 p-2 rounded text-center">
                <p className="text-xs text-gray-500">Innings</p>
                <p className="font-bold">{player.ballingInnings || 0}</p>
              </div>
              <div className="bg-green-50 p-2 rounded text-center">
                <p className="text-xs text-gray-500">Wickets</p>
                <p className="font-bold">{player.wickets || 0}</p>
              </div>
              <div className="bg-green-50 p-2 rounded text-center">
                <p className="text-xs text-gray-500">Average</p>
                <p className="font-bold">{player.ballingAverage?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="bg-green-50 p-2 rounded text-center">
                <p className="text-xs text-gray-500">Economy</p>
                <p className="font-bold">{player.economy?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Auction Result (if sold) */}
        {player.status === 'sold' && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-green-600">Sold To</p>
                  <p className="text-lg font-bold">{player.soldToTeam || 'Team'}</p>
                </div>
                <div>
                  <p className="text-sm text-green-600">Sold For</p>
                  <p className="text-lg font-bold">{formatIndianRupee(player.soldAmount || 0)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default PlayerModal;