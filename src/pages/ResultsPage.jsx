// src/pages/ResultsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import { getAllTeams } from '../services/teamService';
import { getSoldPlayersSummary } from '../services/auctionService';
import { formatCurrency } from '../utils/formatters';
import { prepareAuctionResultsForExport } from '../utils/csvParser';
import { useNotification } from '../context/NotificationContext';

const ResultsPage = () => {
  const [teams, setTeams] = useState([]);
  const [soldPlayers, setSoldPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('teams');
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  // Load teams and sold players
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch teams
        const teamsData = await getAllTeams();
        setTeams(teamsData);
        
        // Fetch sold players
        const soldPlayersData = await getSoldPlayersSummary();
        setSoldPlayers(soldPlayersData);
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading auction results:', err);
        setError('Failed to load auction results. Please try again.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Get team name by ID
  const getTeamNameById = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : 'Unknown Team';
  };

  // Handle navigation to team details
  const handleViewTeam = (teamId) => {
    navigate(`/teams/${teamId}`);
  };

  // Export results to CSV
  const handleExportResults = () => {
    try {
      // Prepare data
      const { playerResults, teamResults } = prepareAuctionResultsForExport(soldPlayers, teams);
      
      // Export players data
      const playersCsv = convertToCSV(playerResults);
      downloadCSV(playersCsv, 'auction_player_results.csv');
      
      // Export teams data
      const teamsCsv = convertToCSV(teamResults);
      downloadCSV(teamsCsv, 'auction_team_results.csv');
      
      showSuccess('Results exported successfully');
    } catch (err) {
      console.error('Error exporting results:', err);
      showError('Failed to export results');
    }
  };

  // Helper to convert to CSV
  const convertToCSV = (data) => {
    if (!data || !data.length) return '';
    
    const header = Object.keys(data[0]).join(',');
    const rows = data.map(item => 
      Object.values(item).map(value => 
        typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
      ).join(',')
    );
    
    return [header, ...rows].join('\n');
  };

  // Helper to download CSV
  const downloadCSV = (csvContent, fileName) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      <MainLayout>
        <Loading text="Loading auction results..." />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <ErrorMessage message={error} />
      </MainLayout>
    );
  }

  const playersByTeam = getPlayersByTeam();

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <Card
          title="Auction Results"
          titleVariant="primary"
          subtitle="View final team compositions and player allocations"
        >
          <div className="p-6">
            <p className="text-gray-600">
              The auction results show the final allocation of players to teams and the amount spent.
              You can view results by team or see all player allocations.
            </p>
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
          
          {/* Content */}
          <div className="p-6">
            {/* Teams Summary Tab */}
            {activeTab === 'teams' && (
              <div className="space-y-6">
                {teams.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No teams have been created yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {teams.map(team => {
                      const teamPlayers = playersByTeam[team.id] || [];
                      const totalSpent = teamPlayers.reduce((sum, player) => sum + (player.soldAmount || 0), 0);
                      const remainingBudget = team.wallet || 0;
                      const initialBudget = team.initialWallet || 10000;
                      
                      return (
                        <div key={team.id} className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                          <div className="bg-gray-50 p-4 flex items-center border-b border-gray-200">
                            {team.logo ? (
                              <img 
                                src={team.logo} 
                                alt={`${team.name} Logo`} 
                                className="w-12 h-12 rounded-full mr-4 object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = '/assets/images/team-placeholder.png';
                                }}
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                                <span className="text-xl font-bold text-blue-700">
                                  {team.name.charAt(0)}
                                </span>
                              </div>
                            )}
                            <div>
                              <h3 className="text-lg font-bold text-gray-900">{team.name}</h3>
                              <p className="text-sm text-gray-600">{team.owner || 'No owner specified'}</p>
                            </div>
                            
                            <Button 
                              className="ml-auto"
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewTeam(team.id)}
                            >
                              View Details
                            </Button>
                          </div>
                          
                          <div className="p-4">
                            <div className="grid grid-cols-3 gap-4 mb-4">
                              <div className="bg-green-50 p-3 rounded-lg text-center">
                                <p className="text-xs text-green-600">Wallet</p>
                                <p className="text-lg font-bold text-green-700">
                                  {formatCurrency(remainingBudget)}
                                </p>
                                <p className="text-xs text-green-600">
                                  {((remainingBudget / initialBudget) * 100).toFixed(0)}% left
                                </p>
                              </div>
                              
                              <div className="bg-blue-50 p-3 rounded-lg text-center">
                                <p className="text-xs text-blue-600">Spent</p>
                                <p className="text-lg font-bold text-blue-700">
                                  {formatCurrency(totalSpent)}
                                </p>
                                <p className="text-xs text-blue-600">
                                  {((totalSpent / initialBudget) * 100).toFixed(0)}% used
                                </p>
                              </div>
                              
                              <div className="bg-purple-50 p-3 rounded-lg text-center">
                                <p className="text-xs text-purple-600">Players</p>
                                <p className="text-lg font-bold text-purple-700">
                                  {teamPlayers.length}
                                </p>
                              </div>
                            </div>
                            
                            {teamPlayers.length > 0 ? (
                              <div className="border-t border-gray-200 pt-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">
                                  Players Acquired:
                                </h4>
                                <div className="max-h-40 overflow-y-auto">
                                  <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                      <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Name
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
                                          <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-green-600 font-medium">
                                            {formatCurrency(player.soldAmount || 0)}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            ) : (
                              <div className="border-t border-gray-200 pt-4 text-center">
                                <p className="text-gray-500 text-sm">No players acquired yet</p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            
            {/* Player Allocations Tab */}
            {activeTab === 'players' && (
              <div>
                {soldPlayers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No players have been sold yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
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
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {player.role || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {getTeamNameById(player.soldTo)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-green-600">
                              {formatCurrency(player.soldAmount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                              {formatCurrency(player.basePrice)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Export Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            }
          >
            Back to Home
          </Button>
          
          {(teams.length > 0 || soldPlayers.length > 0) && (
            <Button
              variant="primary"
              onClick={handleExportResults}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              }
            >
              Export Results (CSV)
            </Button>
          )}
        </div>
        
        {/* Additional Stats and Highlights */}
        {soldPlayers.length > 0 && (
          <Card title="Auction Highlights" elevation="md">
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Most Expensive Player */}
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-purple-700 mb-2">Most Expensive Player</h3>
                  {(() => {
                    const mostExpensive = [...soldPlayers].sort((a, b) => 
                      (b.soldAmount || 0) - (a.soldAmount || 0)
                    )[0];
                    
                    return mostExpensive ? (
                      <div className="flex items-center">
                        {mostExpensive.image ? (
                          <img 
                            src={mostExpensive.image} 
                            alt={mostExpensive.name} 
                            className="h-10 w-10 rounded-full mr-3"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/assets/images/player-placeholder.png';
                            }}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                            <span className="text-sm font-bold text-purple-700">
                              {mostExpensive.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-gray-900">{mostExpensive.name}</p>
                          <p className="text-sm text-purple-700">{formatCurrency(mostExpensive.soldAmount)}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">No data available</p>
                    );
                  })()}
                </div>
                
                {/* Team with Most Players */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-700 mb-2">Team with Most Players</h3>
                  {(() => {
                    const teamCounts = Object.entries(playersByTeam)
                      .map(([id, players]) => ({ id, count: players.length }))
                      .sort((a, b) => b.count - a.count);
                    
                    const topTeam = teamCounts[0];
                    
                    return topTeam && topTeam.count > 0 ? (
                      <div>
                        <p className="font-bold text-gray-900">{getTeamNameById(topTeam.id)}</p>
                        <p className="text-sm text-blue-700">{topTeam.count} players acquired</p>
                      </div>
                    ) : (
                      <p className="text-gray-500">No data available</p>
                    );
                  })()}
                </div>
                
                {/* Biggest Spender */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-green-700 mb-2">Biggest Spender</h3>
                  {(() => {
                    const teamSpending = Object.entries(playersByTeam)
                      .map(([id, players]) => ({
                        id,
                        spent: players.reduce((sum, p) => sum + (p.soldAmount || 0), 0)
                      }))
                      .sort((a, b) => b.spent - a.spent);
                    
                    const topSpender = teamSpending[0];
                    
                    return topSpender && topSpender.spent > 0 ? (
                      <div>
                        <p className="font-bold text-gray-900">{getTeamNameById(topSpender.id)}</p>
                        <p className="text-sm text-green-700">{formatCurrency(topSpender.spent)} spent</p>
                      </div>
                    ) : (
                      <p className="text-gray-500">No data available</p>
                    );
                  })()}
                </div>
                
                {/* Total Auction Value */}
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-yellow-700 mb-2">Total Auction Value</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(soldPlayers.reduce((sum, p) => sum + (p.soldAmount || 0), 0))}
                  </p>
                  <p className="text-sm text-yellow-700">{soldPlayers.length} players sold</p>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default ResultsPage;