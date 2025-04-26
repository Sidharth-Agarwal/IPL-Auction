// src/components/admin/AllPlayersView.jsx
import React, { useState, useEffect } from 'react';
import { getAllPlayers, getPlayersByStatus } from '../../services/playerService';
import Card from '../common/Card';
import Button from '../common/Button';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';
import PlayerCard from '../players/PlayerCard';
import { PLAYER_STATUS, PLAYER_ROLES } from '../../utils/constants';
import { useNotification } from '../../context/NotificationContext';

const AllPlayersView = () => {
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const { showError } = useNotification();

  // Load all players on initial render
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const allPlayers = await getAllPlayers();
        setPlayers(allPlayers);
        setFilteredPlayers(allPlayers);
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading players:', err);
        setError('Failed to load players. Please try again.');
        showError('Failed to load players');
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [showError]);

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
    
    // Apply search filter
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
        case 'role':
          valueA = a.role || '';
          valueB = b.role || '';
          break;
        case 'basePrice':
          valueA = a.basePrice || 0;
          valueB = b.basePrice || 0;
          break;
        case 'createdAt':
          valueA = a.createdAt ? new Date(a.createdAt.seconds ? a.createdAt.seconds * 1000 : a.createdAt) : new Date(0);
          valueB = b.createdAt ? new Date(b.createdAt.seconds ? b.createdAt.seconds * 1000 : b.createdAt) : new Date(0);
          break;
        default:
          valueA = a.name || '';
          valueB = b.name || '';
      }
      
      // For strings
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortOrder === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
      }
      
      // For dates
      if (valueA instanceof Date && valueB instanceof Date) {
        return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
      }
      
      // For numbers
      return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
    });
    
    setFilteredPlayers(result);
  }, [players, searchTerm, selectedRole, selectedStatus, sortBy, sortOrder]);

  // Get unique roles from players for filter dropdown
  const uniqueRoles = React.useMemo(() => {
    const roles = new Set();
    players.forEach(player => {
      if (player.role) roles.add(player.role);
    });
    return Array.from(roles);
  }, [players]);

  // Handle sort toggle
  const handleSortClick = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedRole('all');
    setSelectedStatus('all');
    setSortBy('name');
    setSortOrder('asc');
  };

  // Render player detail or action modal
  const handleViewPlayer = (player) => {
    // This could open a modal with player details
    console.log('View player details:', player);
  };

  if (loading) {
    return <Loading text="Loading players..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card title="All Players" subtitle={`${players.length} players in database`}>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search Players
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  className="block w-full rounded-md border-gray-300 pr-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Search by name, role, etc."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Role Filter */}
            <div>
              <label htmlFor="role-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Role
              </label>
              <select
                id="role-filter"
                className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="all">All Roles</option>
                {uniqueRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Status
              </label>
              <select
                id="status-filter"
                className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value={PLAYER_STATUS.AVAILABLE}>Available</option>
                <option value={PLAYER_STATUS.SOLD}>Sold</option>
                <option value={PLAYER_STATUS.UNSOLD}>Unsold</option>
              </select>
            </div>
          </div>

          {/* Sort Controls and Stats */}
          <div className="mt-6 flex flex-wrap justify-between items-center">
            <div className="flex space-x-2 mb-2 md:mb-0">
              <span className="text-sm text-gray-500">Sort by:</span>
              <button
                onClick={() => handleSortClick("name")}
                className={`text-sm px-2 py-1 rounded ${
                  sortBy === "name"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Name {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
              </button>
              <button
                onClick={() => handleSortClick("role")}
                className={`text-sm px-2 py-1 rounded ${
                  sortBy === "role"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Role {sortBy === "role" && (sortOrder === "asc" ? "↑" : "↓")}
              </button>
              <button
                onClick={() => handleSortClick("basePrice")}
                className={`text-sm px-2 py-1 rounded ${
                  sortBy === "basePrice"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Base Price {sortBy === "basePrice" && (sortOrder === "asc" ? "↑" : "↓")}
              </button>
              <button
                onClick={() => handleSortClick("createdAt")}
                className={`text-sm px-2 py-1 rounded ${
                  sortBy === "createdAt"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Date Added {sortBy === "createdAt" && (sortOrder === "asc" ? "↑" : "↓")}
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Showing {filteredPlayers.length} of {players.length} players
              </span>
              <Button 
                variant="outline"
                size="sm" 
                onClick={handleResetFilters}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Player List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredPlayers.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No players found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter to find what you're looking for.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
            {filteredPlayers.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                onClick={handleViewPlayer}
                showDetails={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* Status Counts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50">
          <div className="p-4 text-center">
            <p className="text-sm font-medium text-blue-700">Available Players</p>
            <p className="text-3xl font-bold text-blue-900">
              {players.filter(p => p.status === PLAYER_STATUS.AVAILABLE).length}
            </p>
          </div>
        </Card>
        <Card className="bg-green-50">
          <div className="p-4 text-center">
            <p className="text-sm font-medium text-green-700">Sold Players</p>
            <p className="text-3xl font-bold text-green-900">
              {players.filter(p => p.status === PLAYER_STATUS.SOLD).length}
            </p>
          </div>
        </Card>
        <Card className="bg-yellow-50">
          <div className="p-4 text-center">
            <p className="text-sm font-medium text-yellow-700">Unsold Players</p>
            <p className="text-3xl font-bold text-yellow-900">
              {players.filter(p => p.status === PLAYER_STATUS.UNSOLD).length}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AllPlayersView;