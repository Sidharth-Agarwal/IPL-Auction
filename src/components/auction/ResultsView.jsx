// src/components/auction/ResultsView.jsx
import React, { useState, useEffect } from 'react';
import { getAllPlayers } from '../../services/playerService';
import { getAllTeams } from '../../services/teamService';
import Card from '../common/Card';
import Button from '../common/Button';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';

const ResultsView = () => {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [activeTab, setActiveTab] = useState('teams');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Load auction results on initial render
  useEffect(() => {
    fetchResults();
  }, []);
  
  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load all players
      const playersData = await getAllPlayers();
      setPlayers(playersData);
      
      // Load all teams
      const teamsData = await getAllTeams();
      setTeams(teamsData);
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading auction results:', err);
      setError('Failed to load auction results. Please try again.');
      setLoading(false);
    }
  };
  
  const getTeamById = (teamId) => {
    return teams.find(team => team.id === teamId);
  };
  
  const getTeamName = (teamId) => {
    const team = getTeamById(teamId);
    return team ? team.name : 'Unknown Team';
  };
  
  const getTeamPlayers = (teamId) => {
    return players.filter(player => player.soldTo === teamId);
  };
  
  const getTeamSpent = (teamId) => {
    return getTeamPlayers(teamId).reduce((total, player) => total + (player.soldAmount || 0), 0);
  };
  
  const getSoldPlayers = () => {
    return players.filter(player => player.status === 'sold');
  };
  
  const getUnsoldPlayers = () => {
    return players.filter(player => player.status === 'unsold');
  };
  
  const formatCurrency = (amount) => {
    return `$${amount.toLocaleString()}`;
  };
  
  if (loading) {
    return <Loading text="Loading auction results..." />;
  }
  
  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <ErrorMessage message={error} onDismiss={() => setError(null)} />
      )}
      
      {/* Summary Statistics */}
      <Card title="Auction Summary">
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-sm text-green-600">Total Players</p>
              <p className="text-2xl font-bold text-green-800">{players.length}</p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-sm text-blue-600">Sold Players</p>
              <p className="text-2xl font-bold text-blue-800">{getSoldPlayers().length}</p>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <p className="text-sm text-yellow-600">Unsold Players</p>
              <p className="text-2xl font-bold text-yellow-800">{getUnsoldPlayers().length}</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <p className="text-sm text-purple-600">Total Amount Spent</p>
              <p className="text-2xl font-bold text-purple-800">
                {formatCurrency(getSoldPlayers().reduce((total, player) => total + (player.soldAmount || 0), 0))}
              </p>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('teams')}
              className={`
                py-4 px-6 text-center border-b-2 font-medium text-sm
                ${activeTab === 'teams'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              Teams
            </button>
            
            <button
              onClick={() => setActiveTab('players')}
              className={`
                py-4 px-6 text-center border-b-2 font-medium text-sm
                ${activeTab === 'players'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              Players
            </button>
          </nav>
        </div>
        
        <div className="p-4">
          {/* Teams Tab */}
          {activeTab === 'teams' && (
            <div>
              {teams.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No teams found</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {teams.map(team => {
                    const teamPlayers = getTeamPlayers(team.id);
                    const spent = getTeamSpent(team.id);
                    
                    return (
                      <Card key={team.id} className="border border-gray-200">
                        <div className="p-4">
                          <div className="flex items-center mb-4">
                            {team.logo ? (
                              <img 
                                src={team.logo} 
                                alt={team.name} 
                                className="h-12 w-12 rounded-full mr-4"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3e%3crect x="3" y="3" width="18" height="18" rx="2" ry="2"%3e%3c/rect%3e%3ccircle cx="8.5" cy="8.5" r="1.5"%3e%3c/circle%3e%3cpolyline points="21 15 16 10 5 21"%3e%3c/polyline%3e%3c/svg%3e';
                                }}
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                                <span className="text-lg font-bold text-blue-700">
                                  {team.name.charAt(0)}
                                </span>
                              </div>
                            )}
                            <div>
                              <h3 className="text-xl font-bold">{team.name}</h3>
                              <p className="text-gray-500">{team.owner || 'No owner specified'}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="bg-blue-50 p-3 rounded-lg text-center">
                              <p className="text-xs text-blue-600">Players Acquired</p>
                              <p className="text-lg font-bold text-blue-800">{teamPlayers.length}</p>
                            </div>
                            
                            <div className="bg-green-50 p-3 rounded-lg text-center">
                              <p className="text-xs text-green-600">Total Spent</p>
                              <p className="text-lg font-bold text-green-800">{formatCurrency(spent)}</p>
                            </div>
                            
                            <div className="bg-yellow-50 p-3 rounded-lg text-center">
                              <p className="text-xs text-yellow-600">Remaining Budget</p>
                              <p className="text-lg font-bold text-yellow-800">{formatCurrency(team.wallet || 0)}</p>
                            </div>
                          </div>
                          
                          {/* Team Players */}
                          {teamPlayers.length > 0 ? (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Players:</h4>
                              <div className="border rounded-lg overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {teamPlayers.map(player => (
                                      <tr key={player.id}>
                                        <td className="px-4 py-2 whitespace-nowrap">
                                          <div className="flex items-center">
                                            {player.image ? (
                                              <img 
                                                src={player.image} 
                                                alt={player.name} 
                                                className="h-6 w-6 rounded-full mr-2"
                                                onError={(e) => {
                                                  e.target.onerror = null;
                                                  e.target.src = 'data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3e%3crect x="3" y="3" width="18" height="18" rx="2" ry="2"%3e%3c/rect%3e%3ccircle cx="8.5" cy="8.5" r="1.5"%3e%3c/circle%3e%3cpolyline points="21 15 16 10 5 21"%3e%3c/polyline%3e%3c/svg%3e';
                                                }}
                                              />
                                            ) : (
                                              <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center mr-2">
                                                <span className="text-xs font-bold text-gray-700">
                                                  {player.name.charAt(0)}
                                                </span>
                                              </div>
                                            )}
                                            <span className="text-sm font-medium text-gray-900">{player.name}</span>
                                          </div>
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{player.role || 'N/A'}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-green-600 font-medium">{formatCurrency(player.soldAmount || 0)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          ) : (
                            <p className="text-center text-gray-500 py-4">No players acquired</p>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          
          {/* Players Tab */}
          {activeTab === 'players' && (
            <div>
              {players.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No players found</p>
                </div>
              ) : (
                <div>
                  <div className="bg-white shadow overflow-hidden rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
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
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = 'data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3e%3crect x="3" y="3" width="18" height="18" rx="2" ry="2"%3e%3c/rect%3e%3ccircle cx="8.5" cy="8.5" r="1.5"%3e%3c/circle%3e%3cpolyline points="21 15 16 10 5 21"%3e%3c/polyline%3e%3c/svg%3e';
                                    }}
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                    <span className="text-lg font-bold text-blue-700">
                                      {player.name.charAt(0)}
                                    </span>
                                  </div>
                                )}
                                <div className="text-sm font-medium text-gray-900">{player.name}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.role || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${player.status === 'sold' ? 'bg-green-100 text-green-800' : 
                                player.status === 'unsold' ? 'bg-red-100 text-red-800' : 
                                'bg-blue-100 text-blue-800'}`}>
                                {player.status || 'available'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {player.soldTo ? getTeamName(player.soldTo) : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                              {player.status === 'sold' ? (
                                <span className="text-green-600 font-medium">{formatCurrency(player.soldAmount || 0)}</span>
                              ) : (
                                <span className="text-gray-500">{formatCurrency(player.basePrice || 0)}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultsView;