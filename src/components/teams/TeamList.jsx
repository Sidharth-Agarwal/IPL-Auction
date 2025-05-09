// src/components/teams/TeamList.jsx
import React, { useState, useEffect } from 'react';
import { getAllTeams } from '../../services/teamService';
import TeamCard from './TeamCard';
import Card from '../common/Card';
import Button from '../common/Button';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';
import Modal from '../common/Modal';
import TeamForm from './TeamForm';

const TeamList = () => {
  const [teams, setTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Load teams on initial render
  useEffect(() => {
    fetchTeams();
  }, []);

  // Filter teams when search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredTeams(teams);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = teams.filter(
        team => team.name.toLowerCase().includes(term) || 
                ([team.owner1, team.owner2, team.owner3].filter(Boolean).join(' ').toLowerCase().includes(term))
      );
      setFilteredTeams(filtered);
    }
  }, [teams, searchTerm]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const teamsData = await getAllTeams();
      setTeams(teamsData);
      setFilteredTeams(teamsData);
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading teams:', err);
      setError('Failed to load teams. Please try again.');
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddTeam = () => {
    setEditingTeamId(null);
    setShowAddModal(true);
  };

  const handleEditTeam = (teamId) => {
    setEditingTeamId(teamId);
    setShowAddModal(true);
  };

  const handleFormSuccess = (message) => {
    setShowAddModal(false);
    setSuccessMessage(message);
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
    
    // Refresh teams list
    fetchTeams();
  };

  const handleFormCancel = () => {
    setShowAddModal(false);
    setEditingTeamId(null);
  };

  if (loading) {
    return <Loading text="Loading teams..." />;
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{successMessage}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setSuccessMessage('')}>
            <svg className="fill-current h-6 w-6 text-green-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <title>Close</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
            </svg>
          </span>
        </div>
      )}
      
      {/* Error Display */}
      {error && (
        <ErrorMessage message={error} onDismiss={() => setError(null)} />
      )}
      
      {/* Header with Search and Add Button */}
      <div className="flex flex-col md:flex-row justify-between gap-4 bg-white p-4 rounded-lg shadow">
        <div className="flex-grow">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search Teams
          </label>
          <div className="mt-2 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              id="search"
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Search by name or owner..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>
        <div className="flex items-end">
          <Button 
            variant="primary" 
            size="header"
            onClick={handleAddTeam}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            }
          >
            Add Team
          </Button>
        </div>
      </div>
      
      {/* Teams Grid */}
      {filteredTeams.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-gray-500">No teams found. Create a new team to get started!</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map(team => (
            <TeamCard 
              key={team.id} 
              team={team} 
              onEdit={() => handleEditTeam(team.id)}
            />
          ))}
        </div>
      )}
      
      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={handleFormCancel}
        title={editingTeamId ? "Edit Team" : "Add Team"}
        size="md"
      >
        <TeamForm 
          teamId={editingTeamId} 
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </Modal>
    </div>
  );
};

export default TeamList;