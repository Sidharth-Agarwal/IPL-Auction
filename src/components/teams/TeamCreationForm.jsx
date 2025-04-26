import React, { useState } from 'react';
import { teamService } from '../../services/teamService';

const TeamCreationForm = () => {
  const [teamData, setTeamData] = useState({
    name: '',
    wallet: ''
  });
  const [teamLogo, setTeamLogo] = useState(null);
  const [createdTeams, setCreatedTeams] = useState([]);
  const [error, setError] = useState('');

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTeamData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle logo file selection
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    setTeamLogo(file);
  };

  // Submit team creation
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Validate inputs
      if (!teamData.name.trim()) {
        setError('Team name is required');
        return;
      }

      const wallet = parseFloat(teamData.wallet);
      if (isNaN(wallet) || wallet < 0) {
        setError('Invalid wallet amount');
        return;
      }

      // Create team
      const newTeam = await teamService.createTeam(
        {
          name: teamData.name,
          wallet: wallet
        }, 
        teamLogo
      );

      // Update created teams list
      setCreatedTeams(prev => [...prev, newTeam]);

      // Reset form
      setTeamData({
        name: '',
        wallet: ''
      });
      setTeamLogo(null);
      document.getElementById('teamLogo').value = '';
    } catch (err) {
      setError('Failed to create team');
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Team Creation</h2>

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {/* Team Creation Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-600">
            Team Name
          </label>
          <input 
            type="text"
            id="name"
            name="name"
            value={teamData.name}
            onChange={handleInputChange}
            placeholder="Enter team name"
            required
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="wallet" className="block mb-2 text-sm font-medium text-gray-600">
            Initial Wallet Amount
          </label>
          <input 
            type="number"
            id="wallet"
            name="wallet"
            value={teamData.wallet}
            onChange={handleInputChange}
            placeholder="Enter initial wallet amount"
            required
            min="0"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="teamLogo" className="block mb-2 text-sm font-medium text-gray-600">
            Team Logo
          </label>
          <input 
            type="file" 
            id="teamLogo"
            accept="image/*"
            onChange={handleLogoChange}
            className="w-full text-sm text-gray-500 
              file:mr-4 file:py-2 file:px-4 
              file:rounded-full file:border-0 
              file:text-sm file:bg-blue-50 
              file:text-blue-700 
              hover:file:bg-blue-100"
          />
        </div>

        <button 
          type="submit" 
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-300"
        >
          Create Team
        </button>
      </form>

      {/* Created Teams List */}
      {createdTeams.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Created Teams</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {createdTeams.map((team) => (
              <div 
                key={team.id} 
                className="border rounded-lg p-4 shadow-sm bg-gray-50 flex flex-col items-center"
              >
                {team.logoUrl && (
                  <img 
                    src={team.logoUrl} 
                    alt={`${team.name} logo`} 
                    className="w-24 h-24 object-cover rounded-full mb-3"
                  />
                )}
                <h4 className="font-bold text-lg">{team.name}</h4>
                <p className="text-gray-600">Wallet: {team.wallet}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamCreationForm;