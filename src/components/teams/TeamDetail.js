// src/components/teams/TeamDetail.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTeam } from '../../services/teamService';
import { getPlayer } from '../../services/playerService';
import Card from '../common/Card';
import Button from '../common/Button';

const TeamDetail = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true);
        // Fetch team details
        const teamData = await getTeam(teamId);
        setTeam(teamData);
        
        // Fetch player details for each player in the team
        if (teamData.players && teamData.players.length > 0) {
          const playersData = await Promise.all(
            teamData.players.map(playerId => getPlayer(playerId))
          );
          setPlayers(playersData);
        }
        
        setError(null);
      } catch (err) {
        setError('Failed to load team details. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (teamId) {
      fetchTeamData();
    }
  }, [teamId]);

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

  if (!team) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">Team not found.</p>
        <Button variant="primary" onClick={() => navigate('/teams')}>
          Back to Teams
        </Button>
      </div>
    );
  }

  // Calculate total spent
  const totalSpent = players.reduce((sum, player) => sum + player.soldAmount, 0);

  return (
    <div className="space-y-6">
      {/* Team Header */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-6">
          <div className="flex items-center">
            {team.logo ? (
              <img 
                src={team.logo} 
                alt={`${team.name} Logo`} 
                className="w-20 h-20 rounded-full mr-6 object-cover border-4 border-white"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mr-6 border-4 border-white">
                <span className="text-3xl font-bold text-blue-800">
                  {team.name.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold">{team.name}</h1>
              <p className="text-blue-100">{team.owner || 'No owner specified'}</p>
            </div>
          </div>
        </div>
        
        {/* Team Stats */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-sm">Wallet Balance</p>
              <p className="text-2xl font-bold text-green-600">${team.wallet.toLocaleString()}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-sm">Total Spent</p>
              <p className="text-2xl font-bold text-blue-600">${totalSpent.toLocaleString()}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-sm">Players</p>
              <p className="text-2xl font-bold">{players.length}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Player List */}
      <Card title="Team Players">
        {players.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">This team hasn't acquired any players yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Player
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Batting Style
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bowling Style
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Purchase Price
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {players.map(player => (
                  <tr key={player.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {player.image ? (
                          <img 
                            src={player.image} 
                            alt={player.name} 
                            className="h-10 w-10 rounded-full mr-3"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                            <span className="text-sm font-medium text-gray-500">
                              {player.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{player.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{player.role || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{player.battingStyle || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{player.bowlingStyle || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">
                        ${player.soldAmount.toLocaleString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      
      {/* Back Button */}
      <div className="mt-6">
        <Button variant="secondary" onClick={() => navigate('/teams')}>
          Back to All Teams
        </Button>
      </div>
    </div>
  );
};

export default TeamDetail;