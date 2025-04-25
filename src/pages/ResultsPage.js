// src/pages/ResultsPage.js
import React, { useState, useEffect } from 'react';
import Header from '../components/common/Header';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { getAllTeams } from '../services/teamService';
import { getSoldPlayersSummary } from '../services/auctionService';

const ResultsPage = () => {
  const [teams, setTeams] = useState([]);
  const [soldPlayers, setSoldPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('teams');

  // Load teams and sold players on initial render
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch teams
        const teamsData = await getAllTeams();
        setTeams(teamsData);
        
        // Fetch sold players
        const soldPlayersData = await getSoldPlayersSummary();
        setSoldPlayers(soldPlayersData);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load auction results');
        setLoading(false);
        console.error(err);
      }
    };
    
    fetchData();
  }, []);

  // Get team name by ID
  const getTeamNameById = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : 'Unknown Team';
  };

  // Group players by team
  const getPlayersByTeam = () => {
    const playersByTeam = {};
    
    teams.forEach(team => {
      playersByTeam[team.id] = [];
    });
    
    soldPlayers.forEach(player => {
      if (player.soldTo && playersByTeam[player.soldTo]) {
        playersByTeam[player.soldTo].push(player);
      }
    });
    
    return playersByTeam;
  };

  if (loading) {
    return (
      <div>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
            <p>{error}</p>
          </div>
        </main>
      </div>
    );
  }

  const playersByTeam = getPlayersByTeam();

  return (
    <div>
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-6">
            <h1 className="text-3xl font-bold">Auction Results</h1>
            <p className="text-blue-100">
              View final team compositions and player allocations
            </p>
          </div>
          
          {/* Tab Navigation */}
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
                Teams Summary
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
                Player Allocations
              </button>
            </nav>
          </div>
        </div>
        
        {/* Tab Content */}
        <div className="mb-10">
          {/* Teams Summary Tab */}
          {activeTab === 'teams' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Teams Summary</h2>
              
              {teams.length === 0 ? (
                <Card className="text-center py-8">
                  <p className="text-gray-500">No teams have been created yet.</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {teams.map(team => {
                    const teamPlayers = playersByTeam[team.id] || [];
                    const totalSpent = teamPlayers.reduce((sum, player) => sum + player.soldAmount, 0);
                    const remainingBudget = team.wallet;
                    
                    return (
                      <Card key={team.id} className="overflow-hidden">
                        <div className="bg-gray-50 p-4 flex items-center">
                          {team.logo ? (
                            <img 
                              src={team.logo} 
                              alt={`${team.name} Logo`} 
                              className="w-16 h-16 rounded-full mr-4 object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                              <span className="text-2xl font-bold text-blue-700">
                                {team.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{team.name}</h3>
                            <p className="text-gray-600">{team.owner || 'No owner specified'}</p>
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-blue-50 p-4 rounded-lg text-center">
                              <p className="text-sm text-blue-700">Total Players</p>
                              <p className="text-2xl font-bold text-blue-800">{teamPlayers.length}</p>
                            </div>
                            
                            <div className="bg-green-50 p-4 rounded-lg text-center">
                              <p className="text-sm text-green-700">Remaining Budget</p>
                              <p className="text-2xl font-bold text-green-800">${remainingBudget.toLocaleString()}</p>
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <h4 className="text-lg font-semibold text-gray-800 mb-2">Team Composition</h4>
                            
                            {teamPlayers.length === 0 ? (
                              <p className="text-gray-500 text-center py-4">No players in this team yet.</p>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Player
                                      </th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Role
                                      </th>
                                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Price
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {teamPlayers.map(player => (
                                      <tr key={player.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                          {player.name}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                          {player.role || 'N/A'}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-medium text-green-600">
                                          ${player.soldAmount.toLocaleString()}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          
          {/* Player Allocations Tab */}
          {activeTab === 'players' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Player Allocations</h2>
              
              {soldPlayers.length === 0 ? (
                <Card className="text-center py-8">
                  <p className="text-gray-500">No players have been sold yet.</p>
                </Card>
              ) : (
                <Card>
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
                            Team
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Sold For
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Base Price
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {soldPlayers.map(player => (
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
                                <div className="text-sm font-medium text-gray-900">{player.name}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {player.role || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {getTeamNameById(player.soldTo)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-green-600">
                              ${player.soldAmount.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                              ${player.basePrice.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
        
        {/* Export Actions */}
        <div className="mt-8 text-center">
          <div className="space-x-4">
            <Button
              variant="secondary"
              onClick={() => {
                alert('Export functionality would be implemented here');
              }}
            >
              Export Results (CSV)
            </Button>
            
            <Button
              variant="primary"
              onClick={() => window.location.href = '/'}
            >
              Back to Home
            </Button>
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-800 text-white mt-12 py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} Cricket Auction App. All rights reserved.</p>
          <p className="text-gray-400 text-sm mt-2">
            Results Summary
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ResultsPage;