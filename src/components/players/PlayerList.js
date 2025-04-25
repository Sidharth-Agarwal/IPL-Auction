// src/components/players/PlayerList.js
import React, { useState, useEffect } from 'react';
import { getAllPlayers, getPlayersByStatus } from '../../services/playerService';
import PlayerCard from './PlayerCard';
import Card from '../common/Card';
import Button from '../common/Button';

const PlayerList = ({ 
  onSelectPlayer = null, 
  filterByStatus = null,
  showFilters = true
}) => {
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState(filterByStatus || 'all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        let playersData;
        
        if (filterByStatus) {
          playersData = await getPlayersByStatus(filterByStatus);
        } else {
          playersData = await getAllPlayers();
        }
        
        setPlayers(playersData);
        setFilteredPlayers(playersData);
        setError(null);
      } catch (err) {
        setError('Failed to load players. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [filterByStatus]);

  useEffect(() => {
    // Apply filters when players, searchTerm, selectedFilter, or selectedRole changes
    applyFilters();
  }, [players, searchTerm, selectedFilter, selectedRole]);

  const applyFilters = () => {
    let result = [...players];
    
    // Apply status filter
    if (selectedFilter !== 'all') {
      result = result.filter(player => player.status === selectedFilter);
    }
    
    // Apply role filter
    if (selectedRole !== 'all') {
      result = result.filter(player => player.role === selectedRole);
    }
    
    // Apply search term
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(player => 
        player.name.toLowerCase().includes(term) ||
        (player.role && player.role.toLowerCase().includes(term)) ||
        (player.battingStyle && player.battingStyle.toLowerCase().includes(term)) ||
        (player.bowlingStyle && player.bowlingStyle.toLowerCase().includes(term))
      );
    }
    
    setFilteredPlayers(result);
  };

  const handleSelectPlayer = (player) => {
    if (onSelectPlayer) {
      onSelectPlayer(player);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
        <p>{error}</p>
      </div>
    );
  }

  // Extract unique roles from players for dropdown filter
  const roles = ['all', ...new Set(players.map(player => player.role).filter(Boolean))];

  return (
    <div>
      {showFilters && (
        <Card className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-grow">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search Players
              </label>
              <input
                type="text"
                id="search"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Search by name, role, or style..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Status Filter */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="sold">Sold</option>
                <option value="unsold">Unsold</option>
                <option value="permanently_unsold">Permanently Unsold</option>
              </select>
            </div>
            
            {/* Role Filter */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                id="role"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="all">All Roles</option>
                {roles.filter(role => role !== 'all').map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>
      )}
      
      {filteredPlayers.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-gray-500">No players found matching your criteria.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPlayers.map(player => (
            <PlayerCard
              key={player.id}
              player={player}
              onClick={() => handleSelectPlayer(player)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PlayerList;