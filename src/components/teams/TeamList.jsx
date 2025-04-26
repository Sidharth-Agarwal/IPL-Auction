import React, { useState, useEffect } from 'react';
import { teamService } from '../../services/teamService';
import { playerService } from '../../services/playerService';

const TeamList = () => {
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingTeam, setEditingTeam] = useState(null);
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [selectedPlayers, setSelectedPlayers] = useState([]);

  // Fetch teams and players on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [fetchedTeams, fetchedPlayers] = await Promise.all([
          teamService.getAllTeams(),
          playerService.getAllPlayers()
        ]);
        setTeams(fetchedTeams);
        setPlayers(fetchedPlayers);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch teams and players');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle team deletion
  const handleDeleteTeam = async (teamId) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      try {
        await teamService.deleteTeam(teamId);
        setTeams(teams.filter(team => team.id !== teamId));
      } catch (err) {
        setError('Failed to delete team');
      }
    }
  };

  // Start editing a team
  const handleEditTeam = (team) => {
    setEditingTeam({...team});
    setSelectedLogo(null);
    // Preselect existing players
    setSelectedPlayers(team.players || []);
  };

  // Handle input change in edit mode
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingTeam(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle logo selection for editing
  const handleEditLogoChange = (e) => {
    const file = e.target.files[0];
    setSelectedLogo(file);
  };

  // Handle player selection
  const handlePlayerSelect = (playerId) => {
    setSelectedPlayers(prev => 
      prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };

  // Save edited team
  const handleSaveTeam = async (e) => {
    e.preventDefault();
    try {
      // Prepare update data
      const updateData = {
        name: editingTeam.name,
        wallet: parseFloat(editingTeam.wallet),
        players: selectedPlayers
      };

      // Update team with optional logo
      const updatedTeam = await teamService.updateTeam(
        editingTeam.id, 
        updateData, 
        selectedLogo
      );

      // Update teams list
      setTeams(teams.map(team => 
        team.id === updatedTeam.id ? {...team, ...updatedTeam} : team
      ));

      // Reset editing state
      setEditingTeam(null);
      setSelectedLogo(null);
      setSelectedPlayers([]);
    } catch (err) {
      setError('Failed to update team');
      console.error(err);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Teams List</h2>

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <div 
            key={team.id} 
            className="border rounded-lg p-4 shadow-sm bg-gray-50 relative"
          >
            {/* Team Edit Mode */}
            {editingTeam && editingTeam.id === team.id ? (
              <form onSubmit={handleSaveTeam} className="space-y-4">
                <input 
                  type="text"
                  name="name"
                  value={editingTeam.name}
                  onChange={handleEditInputChange}
                  placeholder="Team Name"
                  required
                  className="w-full border rounded px-3 py-2"
                />
                <input 
                  type="number"
                  name="wallet"
                  value={editingTeam.wallet}
                  onChange={handleEditInputChange}
                  placeholder="Wallet Amount"
                  required
                  className="w-full border rounded px-3 py-2"
                />
                
                {/* Player Selection */}
                <div>
                  <h4 className="text-lg font-semibold mb-2">Select Players</h4>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded p-2">
                    {players.map((player) => (
                      <label 
                        key={player.id} 
                        className="flex items-center space-x-2"
                      >
                        <input 
                          type="checkbox"
                          checked={selectedPlayers.includes(player.id)}
                          onChange={() => handlePlayerSelect(player.id)}
                          className="form-checkbox"
                        />
                        <span>{player.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Logo Upload */}
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleEditLogoChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />

                <div className="flex space-x-2">
                  <button 
                    type="submit"
                    className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    Save
                  </button>
                  <button 
                    type="button"
                    onClick={() => setEditingTeam(null)}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              // Team View Mode
              <>
                {team.logoUrl && (
                  <img 
                    src={team.logoUrl} 
                    alt={`${team.name} logo`} 
                    className="w-32 h-32 object-cover rounded-full mx-auto mb-4"
                  />
                )}
                <h3 className="text-xl font-bold text-center mb-2">{team.name}</h3>
                <div className="text-center text-gray-600 space-y-1">
                  <p>Wallet: {team.wallet}</p>
                  <p>Players: {team.players ? team.players.length : 0}</p>
                </div>
                <div className="flex justify-between mt-4">
                  <button 
                    onClick={() => handleEditTeam(team)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteTeam(team.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* No Teams Message */}
      {teams.length === 0 && (
        <div className="text-center text-gray-500 mt-10">
          <p className="text-xl">No teams found. Start creating teams!</p>
        </div>
      )}
    </div>
  );
};

export default TeamList;