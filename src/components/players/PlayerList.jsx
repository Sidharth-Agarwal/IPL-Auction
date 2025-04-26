// src/components/players/PlayerList.jsx
import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { getAllPlayers, getPlayersByStatus } from '../../services/playerService';
import PlayerCard from './PlayerCard';
import Card from '../common/Card';
import Button from '../common/Button';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';
import { PLAYER_STATUS, PLAYER_ROLES } from '../../utils/constants';

const PlayerList = ({ 
  onSelectPlayer = null, 
  filterByStatus = null,
  showFilters = true,
  title = 'Players',
  emptyMessage = 'No players found',
  className = '',
  gridCols = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  limit = null,
}) => {
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState(filterByStatus || 'all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Load players on initial render
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        let playersData;
        
        if (filterByStatus) {
          playersData = await getPlayersByStatus(filterByStatus);
          setSelectedStatus(filterByStatus);
        } else {
          playersData = await getAllPlayers();
        }
        
        setPlayers(playersData);
        setError(null);
      } catch (err) {
        console.error('Error loading players:', err);
        setError('Failed to load players. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [filterByStatus]);

  // Get unique roles from players for dropdown filter
  const roles = useMemo(() => {
    const uniqueRoles = [...new Set(players.map(player => player.role).filter(Boolean))];
    return ['all', ...uniqueRoles];
  }, [players]);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...players];
    
    // Apply status filter
    if (selectedStatus !== 'all') {
      result = result.filter(player => player.status === selectedStatus);
    }
    
    // Apply role filter
    if (selectedRole !== 'all') {
      result = result.filter(player => player.role === selectedRole);
    }
    
    // Apply search term
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(player => 
        player.name?.toLowerCase().includes(term) ||
        (player.role && player.role.toLowerCase().includes(term)) ||
        (player.battingStyle && player.battingStyle.toLowerCase().includes(term)) ||
        (player.bowlingStyle && player.bowlingStyle.toLowerCase().includes(term))
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let valueA, valueB;
      
      switch (sortBy) {
        case 'name':
          valueA = a.name || '';
          valueB = b.name || '';
          break;
        case 'basePrice':
          valueA = a.basePrice || 0;
          valueB = b.basePrice || 0;
          break;
        case 'role':
          valueA = a.role || '';
          valueB = b.role || '';
          break;
        default:
          valueA = a.name || '';
          valueB = b.name || '';
      }
      
      // For strings, use localeCompare for proper sorting
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortOrder === 'asc' 
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
      
      // For numbers, use simple comparison
      return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
    });
    
    // Apply limit if specified
    if (limit && result.length > limit) {
      result = result.slice(0, limit);
    }
    
    setFilteredPlayers(result);
  }, [players, selectedStatus, selectedRole, searchTerm, sortBy, sortOrder, limit]);

  const handleSelectPlayer = (player) => {
    setSelectedPlayerId(player.id);
    if (onSelectPlayer) {
      onSelectPlayer(player);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedRole('all');
    setSelectedStatus(filterByStatus || 'all');
    setSortBy('name');
    setSortOrder('asc');
  };

  // Toggle sort order when clicking on the same sort field
  const handleSortClick = (field) => {
    if (sortBy === field) {
      setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  if (loading) {
    return <Loading text="Loading players..." />;
  }

  return (
    <div className={className}>
      {showFilters && (
        <Card className="mb-6">
          <div className="p-4 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-grow">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search Players
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="search"
                    className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Search by name, role, or style..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Status Filter */}
              {!filterByStatus && (
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value={PLAYER_STATUS.AVAILABLE}>Available</option>
                    <option value={PLAYER_STATUS.SOLD}>Sold</option>
                    <option value={PLAYER_STATUS.UNSOLD}>Unsold</option>
                  </select>
                </div>
              )}
              
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
                  {Object.values(PLAYER_ROLES).map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Sort Controls */}
            <div className="flex flex-wrap justify-between items-center pt-2">
              <div className="flex flex-wrap items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">Sort by:</span>
                <div className="flex space-x-2">
                  <button
                    className={`px-3 py-1 text-sm rounded-md ${
                      sortBy === 'name' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
                    }`}
                    onClick={() => handleSortClick('name')}
                  >
                    Name {sortBy === 'name' && (
                      <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                  <button
                    className={`px-3 py-1 text-sm rounded-md ${
                      sortBy === 'basePrice' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
                    }`}
                    onClick={() => handleSortClick('basePrice')}
                  >
                    Price {sortBy === 'basePrice' && (
                      <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                  <button
                    className={`px-3 py-1 text-sm rounded-md ${
                      sortBy === 'role' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
                    }`}
                    onClick={() => handleSortClick('role')}
                  >
                    Role {sortBy === 'role' && (
                      <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </div>
              </div>
              
              {/* Clear Filters */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="mt-2 sm:mt-0"
              >
                Clear Filters
              </Button>
            </div>
            
            {/* Filter Results */}
            <div className="pt-2 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing {filteredPlayers.length} of {players.length} players
              </p>
            </div>
          </div>
        </Card>
      )}
      
      {error && (
        <ErrorMessage message={error} />
      )}
      
      {filteredPlayers.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-gray-500">{emptyMessage}</p>
        </Card>
      ) : (
        <div className={`grid ${gridCols} gap-6`}>
          {filteredPlayers.map(player => (
            <PlayerCard
              key={player.id}
              player={player}
              onClick={onSelectPlayer ? handleSelectPlayer : undefined}
              selected={player.id === selectedPlayerId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

PlayerList.propTypes = {
  onSelectPlayer: PropTypes.func,
  filterByStatus: PropTypes.string,
  showFilters: PropTypes.bool,
  title: PropTypes.string,
  emptyMessage: PropTypes.string,
  className: PropTypes.string,
  gridCols: PropTypes.string,
  limit: PropTypes.number
};

export default PlayerList;