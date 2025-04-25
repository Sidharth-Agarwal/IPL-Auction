// src/components/teams/TeamList.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllTeams } from '../../services/teamService';
import Card from '../common/Card';
import Button from '../common/Button';

const TeamList = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const teamsData = await getAllTeams();
        setTeams(teamsData);
        setError(null);
      } catch (err) {
        setError('Failed to load teams. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const handleViewTeam = (teamId) => {
    navigate(`/teams/${teamId}`);
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

  if (teams.length === 0) {
    return (
      <Card className="text-center py-8">
        <p className="text-gray-500 mb-4">No teams have been created yet.</p>
        <Button variant="primary" onClick={() => navigate('/admin')}>
          Go to Admin Panel
        </Button>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {teams.map(team => (
        <Card key={team.id} className="h-full flex flex-col">
          <div className="flex items-center mb-4">
            {team.logo ? (
              <img 
                src={team.logo} 
                alt={`${team.name} Logo`} 
                className="w-16 h-16 rounded-full mr-4 object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                <span className="text-2xl font-bold text-gray-500">
                  {team.name.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h3 className="text-xl font-bold text-gray-800">{team.name}</h3>
              <p className="text-gray-600">{team.owner || 'No owner specified'}</p>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Wallet Balance:</span>
              <span className="font-bold text-green-600">${team.wallet.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Players:</span>
              <span className="font-bold">{team.players ? team.players.length : 0}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <Button 
              variant="primary" 
              onClick={() => handleViewTeam(team.id)}
              fullWidth
            >
              View Team
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default TeamList;