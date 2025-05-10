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
      size="md" // Changed back to "md" for wider modal
    >
      <div className="p-2">
        <div className="flex items-start space-x-3">
          {/* Player Image */}
          <div className="flex-shrink-0">
            {player.imageUrl ? (
              <img 
                src={player.imageUrl} 
                alt={player.name} 
                className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3e%3crect x="3" y="3" width="18" height="18" rx="2" ry="2"%3e%3c/rect%3e%3ccircle cx="8.5" cy="8.5" r="1.5"%3e%3c/circle%3e%3cpolyline points="21 15 16 10 5 21"%3e%3c/polyline%3e%3c/svg%3e';
                }}
              />
            ) : (
              <div className="w-20 h-20 rounded-lg bg-blue-100 flex items-center justify-center border border-blue-200">
                <span className="text-2xl font-bold text-blue-700">
                  {player.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="mt-1 flex flex-wrap gap-1 justify-center">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {player.playerType || 'Player'}
              </span>
              {player.isCapped && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {player.isCapped === 'capped' ? 'Capped' : 'Uncapped'}
                </span>
              )}
            </div>
          </div>
          
          {/* Player Details */}
          <div className="flex-grow">
            {/* Wider layout for details */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <div className="mb-1"> {/* Base Price */}
                  <p className="text-xs text-gray-500">Base Price</p>
                  <p className="text-base font-bold text-green-600">{formatIndianRupee(player.basePrice || 1000)}</p>
                </div>
                <div> {/* Gender */}
                  <p className="text-xs text-gray-500">Gender</p>
                  <span className={`inline-block px-1.5 py-0.5 rounded-full text-xs capitalize ${
                    player.gender === 'female' ? 'bg-pink-100 text-pink-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {player.gender || 'Male'}
                  </span>
                </div>
              </div>
              <div>
                <div className="mb-1"> {/* Status */}
                  <p className="text-xs text-gray-500">Status</p>
                  <span className={`inline-block px-1.5 py-0.5 rounded-full text-xs font-medium ${
                    player.status === 'sold' ? 'bg-green-100 text-green-800' : 
                    player.status === 'unsold' ? 'bg-red-100 text-red-800' : 
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {player.status || 'Available'}
                  </span>
                </div>
                <div> {/* Specialization */}
                  <p className="text-xs text-gray-500">Specialization</p>
                  <p className="text-xs">{player.specialization || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            {/* Batting and Bowling Style */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-gray-500">Batting Style</p>
                <p>{player.battingStyle || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500">Bowling Type</p>
                <p>{player.ballingType || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Player Statistics - Wider layout */}
        <div className="mt-2 pt-2 border-t border-gray-200">
          <h3 className="text-xs font-medium text-gray-700 mb-1">Player Statistics</h3>
          
          {/* Batting Stats - 4 columns layout for wider view */}
          <div className="mb-2">
            <h4 className="text-xs font-medium text-blue-600 mb-1">Batting</h4>
            <div className="grid grid-cols-4 gap-1"> {/* Changed back to 4 columns for wider layout */}
              <div className="bg-blue-50 p-1 rounded text-center text-xs">
                <p className="text-gray-500">Innings</p>
                <p className="font-bold">{player.battingInnings || 0}</p>
              </div>
              <div className="bg-blue-50 p-1 rounded text-center text-xs">
                <p className="text-gray-500">Runs</p>
                <p className="font-bold">{player.runs || 0}</p>
              </div>
              <div className="bg-blue-50 p-1 rounded text-center text-xs">
                <p className="text-gray-500">Average</p>
                <p className="font-bold">{player.battingAverage?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="bg-blue-50 p-1 rounded text-center text-xs">
                <p className="text-gray-500">Strike Rate</p>
                <p className="font-bold">{player.strikeRate?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </div>
          
          {/* Bowling Stats - 4 columns layout for wider view */}
          <div>
            <h4 className="text-xs font-medium text-green-600 mb-1">Bowling</h4>
            <div className="grid grid-cols-4 gap-1"> {/* Changed back to 4 columns for wider layout */}
              <div className="bg-green-50 p-1 rounded text-center text-xs">
                <p className="text-gray-500">Innings</p>
                <p className="font-bold">{player.ballingInnings || 0}</p>
              </div>
              <div className="bg-green-50 p-1 rounded text-center text-xs">
                <p className="text-gray-500">Wickets</p>
                <p className="font-bold">{player.wickets || 0}</p>
              </div>
              <div className="bg-green-50 p-1 rounded text-center text-xs">
                <p className="text-gray-500">Average</p>
                <p className="font-bold">{player.ballingAverage?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="bg-green-50 p-1 rounded text-center text-xs">
                <p className="text-gray-500">Economy</p>
                <p className="font-bold">{player.economy?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Auction Result (if sold) */}
        {player.status === 'sold' && (
          <div className="mt-2 pt-2 border-t border-gray-200 text-xs">
            <div className="bg-green-50 p-1.5 rounded-lg flex justify-between items-center">
              <div>
                <p className="text-xs text-green-600">Sold To</p>
                <p className="font-bold">{player.soldToTeam || 'Team'}</p>
              </div>
              <div>
                <p className="text-xs text-green-600">Sold For</p>
                <p className="font-bold">{formatIndianRupee(player.soldAmount || 0)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default PlayerModal;