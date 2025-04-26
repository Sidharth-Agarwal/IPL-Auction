// src/components/teams/TeamDetail.jsx
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { getTeam } from '../../services/teamService';
import { getPlayer } from '../../services/playerService';
import Card from '../common/Card';
import Button from '../common/Button';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';
import PlayerCard from '../players/PlayerCard'
import { formatCurrency } from '../../utils/formatters';

const TeamDetail = ({ teamId, className = '' }) => {
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [loadingPlayers, setLoadingPlayers] = useState(false);

  useEffect(() => {
    const fetchTeamData = async () => {
      if (!teamId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch team details
        const teamData = await getTeam(teamId);
        setTeam(teamData);
        
        // Fetch player details if team has players
        if (teamData.players && teamData.players.length > 0) {
          setLoadingPlayers(true);
          
          try {
            const playersData = await Promise.all(
              teamData.players.map(playerId => getPlayer(playerId))
            );
            
            // Filter out any null values (in case some players couldn't be fetched)
            setPlayers(playersData.filter(Boolean));
          } catch (playerError) {
            console.error('Error loading team players:', playerError);
            // Don't set the main error - we at least have the team data
          } finally {
            setLoadingPlayers(false);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading team details:', err);
        setError('Failed to load team details. Please try again.');
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [teamId]);

  const handleViewPlayer = (player) => {
    // Navigate to player details or show in modal
    console.log('View player:', player);
  };

  // Calculate team stats
  const calculateTeamStats = () => {
    if (!team || !players.length) return {};
    
    const totalSpent = players.reduce((sum, player) => sum + (player.soldAmount || 0), 0);
    const initialWallet = team.initialWallet || 10000; // Default if not specified
    const remainingBudget = team.wallet || 0;
    
    // Player role counts
    const roleCount = players.reduce((counts, player) => {
      const role = player.role || 'Unknown';
      counts[role] = (counts[role] || 0) + 1;
      return counts;
    }, {});
    
    // Stats totals
    const totalRuns = players.reduce((sum, player) => {
      return sum + (player.stats?.runs || 0);
    }, 0);
    
    const totalWickets = players.reduce((sum, player) => {
      return sum + (player.stats?.wickets || 0);
    }, 0);
    
    return {
      totalSpent,
      spentPercentage: ((totalSpent / initialWallet) * 100).toFixed(1),
      remainingBudget,
      remainingPercentage: ((remainingBudget / initialWallet) * 100).toFixed(1),
      roleCount,
      totalRuns,
      totalWickets,
      playerCount: players.length
    };
  };

  const teamStats = calculateTeamStats();

  if (loading) {
    return <Loading text="Loading team details..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!team) {
    return (
      <Card className="text-center py-8">
        <p className="text-gray-500 mb-4">Team not found.</p>
        <Button variant="primary" onClick={() => navigate('/teams')}>
          Back to Teams
        </Button>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Team Header */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-6">
          <div className="flex items-center">
            {team.logo ? (
              <img 
                src={team.logo} 
                alt={`${team.name} Logo`} 
                className="w-20 h-20 rounded-full mr-6 object-cover border-4 border-white"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/assets/images/team-placeholder.png';
                }}
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
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-gray-500 text-sm">Wallet Balance</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(team.wallet)}</p>
              <p className="text-sm text-green-600">{teamStats.remainingPercentage}% remaining</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-gray-500 text-sm">Total Spent</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(teamStats.totalSpent)}</p>
              <p className="text-sm text-blue-600">{teamStats.spentPercentage}% of budget</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-gray-500 text-sm">Players</p>
              <p className="text-2xl font-bold text-purple-600">{players.length}</p>
              <div className="text-sm text-purple-600 flex justify-center space-x-2">
                {Object.entries(teamStats.roleCount || {}).map(([role, count]) => (
                  <span key={role} className="whitespace-nowrap">{role}: {count}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Team Players */}
      <Card 
        title="Team Players" 
        titleVariant={players.length > 0 ? 'default' : 'transparent'}
        actions={
          players.length > 0 ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedPosition(null)}
                className={selectedPosition === null ? 'bg-blue-50' : ''}
              >
                All
              </Button>
              {Object.keys(teamStats.roleCount || {}).map(role => (
                <Button
                  key={role}
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPosition(role)}
                  className={selectedPosition === role ? 'bg-blue-50' : ''}
                >
                  {role}
                </Button>
              ))}
            </div>
          ) : null
        }
      >
        {loadingPlayers ? (
          <div className="flex justify-center py-8">
            <Loading size="md" text="Loading players..." />
          </div>
        ) : players.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">This team hasn't acquired any players yet.</p>
          </div>
        ) : (
          <div className="p-4">
            {/* List view for larger screens */}
            <div className="hidden md:block overflow-x-auto">
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
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Purchase Price
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {players
                    .filter(player => !selectedPosition || player.role === selectedPosition)
                    .map(player => (
                      <tr 
                        key={player.id} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleViewPlayer(player)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {player.image ? (
                              <img 
                                src={player.image} 
                                alt={player.name} 
                                className="h-10 w-10 rounded-full mr-3"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = '/assets/images/player-placeholder.png';
                                }}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                                <span className="text-sm font-medium text-gray-500">
                                  {player.name.charAt(0)}
                                </span>
                              </div>
                            )}
                            <div className="text-sm font-medium text-gray-900">{player.name}</div>
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
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm font-medium text-green-600">
                            {formatCurrency(player.soldAmount || 0)}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            
            {/* Card view for mobile */}
            <div className="md:hidden grid grid-cols-1 gap-4">
              {players
                .filter(player => !selectedPosition || player.role === selectedPosition)
                .map(player => (
                  <div 
                    key={player.id}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                    onClick={() => handleViewPlayer(player)}
                  >
                    <div className="p-4 flex items-center">
                      {player.image ? (
                        <img 
                          src={player.image} 
                          alt={player.name} 
                          className="h-12 w-12 rounded-full mr-4"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                          <span className="text-lg font-medium text-gray-500">
                            {player.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{player.name}</div>
                        <div className="text-sm text-gray-500">{player.role || 'Player'}</div>
                      </div>
                      <div className="ml-auto text-green-600 font-medium">
                        {formatCurrency(player.soldAmount || 0)}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </Card>
      
      {/* Back Button */}
      <div className="flex justify-between">
        <Button variant="secondary" onClick={() => navigate('/teams')}>
          Back to All Teams
        </Button>
        
        {team.players && team.players.length > 0 && (
          <Button 
            variant="outline" 
            onClick={() => window.print()}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
            }
          >
            Print Team Roster
          </Button>
        )}
      </div>
    </div>
  );
};

TeamDetail.propTypes = {
  teamId: PropTypes.string.isRequired,
  className: PropTypes.string
};

export default TeamDetail;