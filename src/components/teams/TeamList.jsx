// src/components/teams/TeamList.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { getAllTeams } from '../../services/teamService';
import TeamCard from './TeamCard';
import Card from '../common/Card';
import Button from '../common/Button';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';

const TeamList = ({ 
  onSelectTeam,
  showCreateButton = true,
  showFilters = true,
  gridCols = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  className = '',
  emptyMessage = 'No teams found'
}) => {
  const [teams, setTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const navigate = useNavigate();

  // Load teams on initial render
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const teamsData = await getAllTeams();
        setTeams(teamsData);
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading teams:', err);
        setError('Failed to load teams. Please try again.');
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...teams];
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(team => 
        team.name.toLowerCase().includes(term) ||
        (team.owner && team.owner.toLowerCase().includes(term))
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
        case 'wallet':
          valueA = a.wallet || 0;
          valueB = b.wallet || 0;
          break;
        case 'players':
          valueA = (a.players || []).length;
          valueB = (b.players || []).length;
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
    
    setFilteredTeams(result);
  }, [teams, searchTerm, sortBy, sortOrder]);

  const handleViewTeam = (team) => {
    navigate(`/teams/${team.id}`);
  };

  const handleSelectTeam = (team) => {
    if (onSelectTeam) {
      onSelectTeam(team);
    } else {
      navigate(`/teams/${team.id}`);
    }
  };

  const handleCreateTeam = () => {
    navigate('/admin?tab=teams');
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
    return <Loading text="Loading teams..." />;
  }

  return (
    <div className={className}>
      {/* Filters and Actions */}
      {showFilters && (
        <Card className="mb-6">
          <div className="p-4 space-y-4">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              {/* Search */}
              <div className="flex-grow">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search Teams
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
                    placeholder="Search by team name or owner..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Create Team Button (if enabled) */}
              {showCreateButton && (
                <div className="flex items-end">
                  <Button
                    variant="primary"
                    onClick={handleCreateTeam}
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    }
                  >
                    Create Team
                  </Button>
                </div>
              )}
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
                      sortBy === 'wallet' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
                    }`}
                    onClick={() => handleSortClick('wallet')}
                  >
                    Wallet {sortBy === 'wallet' && (
                      <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                  <button
                    className={`px-3 py-1 text-sm rounded-md ${
                      sortBy === 'players' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
                    }`}
                    onClick={() => handleSortClick('players')}
                  >
                    Players {sortBy === 'players' && (
                      <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </div>
              </div>
              
              {/* Results Count */}
              <div className="text-sm text-gray-600">
                Showing {filteredTeams.length} of {teams.length} teams
              </div>
            </div>
          </div>
        </Card>
      )}
      
      {/* Error Display */}
      {error && (
        <ErrorMessage message={error} />
      )}
      
      {/* Team List */}
      {filteredTeams.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-gray-500 mb-4">{emptyMessage}</p>
          {showCreateButton && (
            <Button variant="primary" onClick={handleCreateTeam}>
              Create New Team
            </Button>
          )}
        </Card>
      ) : (
        <div className={`grid ${gridCols} gap-6`}>
          {filteredTeams.map(team => (
            <TeamCard
              key={team.id}
              team={team}
              onViewDetails={handleViewTeam}
              onSelectTeam={onSelectTeam ? handleSelectTeam : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};

TeamList.propTypes = {
  onSelectTeam: PropTypes.func,
  showCreateButton: PropTypes.bool,
  showFilters: PropTypes.bool,
  gridCols: PropTypes.string,
  className: PropTypes.string,
  emptyMessage: PropTypes.string
};

export default TeamList;