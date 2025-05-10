// src/components/auction/ResultsView.jsx
import React, { useState, useEffect } from 'react';
import { getAllPlayers } from '../../services/playerService';
import { getAllTeams } from '../../services/teamService';
import Card from '../common/Card';
import Button from '../common/Button';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';
import { formatIndianRupee } from '../../utils/currencyUtils';

const ResultsView = () => {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [activeTab, setActiveTab] = useState('teams');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  
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

  // Helper function to render player image
  const renderPlayerImage = (player, imgClass = "h-10 w-10 rounded-full mr-3") => {
    return player.imageUrl ? (
      <img 
        src={player.imageUrl} 
        alt={player.name} 
        className={imgClass}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = 'data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3e%3crect x="3" y="3" width="18" height="18" rx="2" ry="2"%3e%3c/rect%3e%3ccircle cx="8.5" cy="8.5" r="1.5"%3e%3c/circle%3e%3cpolyline points="21 15 16 10 5 21"%3e%3c/polyline%3e%3c/svg%3e';
        }}
      />
    ) : (
      <div className={imgClass.replace("mr-3", "") + " bg-blue-100 flex items-center justify-center"}>
        <span className="text-lg font-bold text-blue-700">
          {player.name.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  };

  // Helper function to render team logo
  const renderTeamLogo = (team, imgClass = "h-12 w-12 rounded-full mr-4") => {
    return team.logoUrl ? (
      <img 
        src={team.logoUrl} 
        alt={team.name} 
        className={imgClass}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = 'data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3e%3crect x="3" y="3" width="18" height="18" rx="2" ry="2"%3e%3c/rect%3e%3ccircle cx="8.5" cy="8.5" r="1.5"%3e%3c/circle%3e%3cpolyline points="21 15 16 10 5 21"%3e%3c/polyline%3e%3c/svg%3e';
        }}
      />
    ) : (
      <div className={imgClass.replace("mr-4", "") + " bg-blue-100 flex items-center justify-center border border-blue-200"}>
        <span className="text-lg font-bold text-blue-700">
          {team.name.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  };

  // Export team data to CSV
  const exportTeamDataToCSV = (teamId) => {
    try {
      setExportLoading(true);
      const team = getTeamById(teamId);
      if (!team) throw new Error('Team not found');
      
      const teamPlayers = getTeamPlayers(teamId);
      
      // No players to export
      if (teamPlayers.length === 0) {
        alert('No players to export for this team.');
        setExportLoading(false);
        return;
      }
      
      // Prepare CSV content with team details in header
      let csvContent = 'Team Information\n';
      csvContent += `Team Name,${team.name}\n`;
      csvContent += `Owners,${[team.owner1, team.owner2, team.owner3].filter(Boolean).join(' / ') || 'N/A'}\n`;
      csvContent += `Team Captain,${team.captain || 'N/A'}\n`;
      csvContent += `Woman Captain,${team.womanCaptain || 'N/A'}\n`;
      csvContent += `Total Budget,${formatIndianRupee(team.wallet + getTeamSpent(team.id), false)}\n`;
      csvContent += `Remaining Budget,${formatIndianRupee(team.wallet, false)}\n`;
      csvContent += `Players Acquired,${teamPlayers.length}\n\n`;
      
      // Add player details with all columns
      const headers = [
        'Name',
        'Gender',
        'Capped/Uncapped',
        'Player_Type',
        'Specialization',
        'Batting_Style',
        'Balling_Type',
        'Minimum_Bidding_Amount',
        'Batting_Innings',
        'Runs',
        'Batting_Average',
        'Strike_Rate',
        'Balling_innings',
        'Wickets',
        'Balling_Average',
        'Economy',
        'Sold_Amount'
      ];
      
      csvContent += headers.join(',') + '\n';
      
      // Add player data rows
      teamPlayers.forEach(player => {
        const row = [
          `"${player.name || ''}"`,
          `"${player.gender || 'male'}"`,
          `"${player.isCapped || 'uncapped'}"`,
          `"${player.playerType || ''}"`,
          `"${player.specialization || ''}"`,
          `"${player.battingStyle || ''}"`,
          `"${player.ballingType || ''}"`,
          player.basePrice || 1000,
          player.battingInnings || 0,
          player.runs || 0,
          player.battingAverage || 0,
          player.strikeRate || 0,
          player.ballingInnings || 0,
          player.wickets || 0,
          player.ballingAverage || 0,
          player.economy || 0,
          player.soldAmount || 0
        ];
        csvContent += row.join(',') + '\n';
      });
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${team.name}_Players.csv`);
      document.body.appendChild(link);
      
      // Trigger download and cleanup
      link.click();
      document.body.removeChild(link);
      setExportLoading(false);
    } catch (err) {
      console.error('Error exporting team data:', err);
      alert('Failed to export team data. Please try again.');
      setExportLoading(false);
    }
  };

  // Export all teams data to CSV
  const exportAllTeamsDataToCSV = () => {
    try {
      setExportLoading(true);
      
      // If no sold players, show alert
      if (getSoldPlayers().length === 0) {
        alert('No player data to export.');
        setExportLoading(false);
        return;
      }
      
      // Prepare CSV content with all headers
      const headers = [
        'Team Name', 
        'Owner 1', 
        'Owner 2', 
        'Owner 3', 
        'Team Captain', 
        'Woman Captain',
        'Name',
        'Gender',
        'Capped/Uncapped',
        'Player_Type',
        'Specialization',
        'Batting_Style',
        'Balling_Type',
        'Minimum_Bidding_Amount',
        'Batting_Innings',
        'Runs',
        'Batting_Average',
        'Strike_Rate',
        'Balling_innings',
        'Wickets',
        'Balling_Average',
        'Economy',
        'Sold_Amount'
      ];
      
      let csvContent = headers.join(',') + '\n';
      
      // Add data for each team and their players
      teams.forEach(team => {
        const teamPlayers = getTeamPlayers(team.id);
        
        if (teamPlayers.length > 0) {
          teamPlayers.forEach(player => {
            const row = [
              `"${team.name}"`,
              `"${team.owner1 || ''}"`,
              `"${team.owner2 || ''}"`,
              `"${team.owner3 || ''}"`,
              `"${team.captain || ''}"`,
              `"${team.womanCaptain || ''}"`,
              `"${player.name || ''}"`,
              `"${player.gender || 'male'}"`,
              `"${player.isCapped || 'uncapped'}"`,
              `"${player.playerType || ''}"`,
              `"${player.specialization || ''}"`,
              `"${player.battingStyle || ''}"`,
              `"${player.ballingType || ''}"`,
              player.basePrice || 1000,
              player.battingInnings || 0,
              player.runs || 0,
              player.battingAverage || 0,
              player.strikeRate || 0,
              player.ballingInnings || 0,
              player.wickets || 0,
              player.ballingAverage || 0,
              player.economy || 0,
              player.soldAmount || 0
            ];
            csvContent += row.join(',') + '\n';
          });
        }
      });
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'Auction_Results.csv');
      document.body.appendChild(link);
      
      // Trigger download and cleanup
      link.click();
      document.body.removeChild(link);
      setExportLoading(false);
    } catch (err) {
      console.error('Error exporting all teams data:', err);
      alert('Failed to export auction results. Please try again.');
      setExportLoading(false);
    }
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
                {formatIndianRupee(getSoldPlayers().reduce((total, player) => total + (player.soldAmount || 0), 0))}
              </p>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Export All Button */}
      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={exportAllTeamsDataToCSV}
          loading={exportLoading}
          loadingText="Exporting..."
          disabled={exportLoading}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          }
        >
          Export All Teams Data
        </Button>
      </div>
      
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
                // Changed from a vertical list to a column-wise grid layout
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {teams.map(team => {
                    const teamPlayers = getTeamPlayers(team.id);
                    const spent = getTeamSpent(team.id);
                    
                    // Helper to display team ownership details properly
                    const displayOwners = () => {
                      const owners = [team.owner1, team.owner2, team.owner3].filter(Boolean);
                      if (owners.length === 0) return 'No owners specified';
                      return owners.join(', ');
                    };
                    
                    return (
                      <Card key={team.id} className="border border-gray-200">
                        <div className="p-4">
                          <div className="flex items-center mb-4">
                            {renderTeamLogo(team)}
                            <div>
                              <h3 className="text-xl font-bold">{team.name}</h3>
                              <p className="text-gray-500">{displayOwners()}</p>
                            </div>
                          </div>
                          
                          {/* Team Leadership Information */}
                          {(team.captain || team.womanCaptain) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                              {team.captain && (
                                <div className="bg-indigo-50 p-2 rounded-lg text-sm">
                                  <span className="text-indigo-600 font-medium">Captain:</span> {team.captain}
                                </div>
                              )}
                              {team.womanCaptain && (
                                <div className="bg-pink-50 p-2 rounded-lg text-sm">
                                  <span className="text-pink-600 font-medium">Woman Captain:</span> {team.womanCaptain}
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Team Stats */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="bg-blue-50 p-3 rounded-lg text-center">
                              <p className="text-xs text-blue-600">Players Acquired</p>
                              <p className="text-lg font-bold text-blue-800">{teamPlayers.length}</p>
                            </div>
                            
                            <div className="bg-green-50 p-3 rounded-lg text-center">
                              <p className="text-xs text-green-600">Total Spent</p>
                              <p className="text-lg font-bold text-green-800">{formatIndianRupee(spent)}</p>
                            </div>
                            
                            <div className="bg-yellow-50 p-3 rounded-lg text-center">
                              <p className="text-xs text-yellow-600">Remaining Budget</p>
                              <p className="text-lg font-bold text-yellow-800">{formatIndianRupee(team.wallet || 0)}</p>
                            </div>
                          </div>
                          
                          {/* Team Players */}
                          {teamPlayers.length > 0 ? (
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="text-sm font-medium text-gray-700">Players:</h4>
                                {/* Export Button */}
                                <Button 
                                  variant="outline" 
                                  size="xs"
                                  onClick={() => exportTeamDataToCSV(team.id)}
                                  disabled={exportLoading}
                                  icon={
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                  }
                                >
                                  Export CSV
                                </Button>
                              </div>
                              <div className="border rounded-lg overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Gender</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {teamPlayers.map(player => (
                                      <tr key={player.id}>
                                        <td className="px-4 py-2 whitespace-nowrap">
                                          <div className="flex items-center">
                                            {renderPlayerImage(player, "h-6 w-6 rounded-full mr-2")}
                                            <div>
                                              <span className="text-sm font-medium text-gray-900">{player.name}</span>
                                              <div className="text-xs text-gray-500">
                                                {player.isCapped === 'capped' ? (
                                                  <span className="px-1.5 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">C</span>
                                                ) : (
                                                  <span className="px-1.5 py-0.5 bg-gray-100 text-gray-800 rounded-full text-xs">U</span>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap">
                                          <div className="text-sm text-gray-500">
                                            {player.gender === 'female' ? (
                                              <span className="px-1.5 py-0.5 bg-pink-100 text-pink-800 rounded-full text-xs capitalize">F</span>
                                            ) : (
                                              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs capitalize">M</span>
                                            )}
                                          </div>
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{player.playerType || 'N/A'}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-green-600 font-medium">{formatIndianRupee(player.soldAmount || 0)}</td>
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
          
          {/* Players Tab - Updated with gender field */}
          {activeTab === 'players' && (
            <div>
              {players.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No players found</p>
                </div>
              ) : (
                <div>
                  <div className="bg-white shadow overflow-hidden rounded-lg">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialization</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batting</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bowling</th>
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
                                  {renderPlayerImage(player)}
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">{player.name}</div>
                                    <div className="text-xs text-gray-500">
                                      {player.isCapped === 'capped' ? (
                                        <span className="px-1.5 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">Capped</span>
                                      ) : (
                                        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-800 rounded-full text-xs">Uncapped</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">
                                  {player.gender === 'female' ? (
                                    <span className="px-1.5 py-0.5 bg-pink-100 text-pink-800 rounded-full text-xs capitalize">
                                      {player.gender || 'Male'}
                                    </span>
                                  ) : (
                                    <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs capitalize">
                                      {player.gender || 'Male'}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{player.playerType || 'N/A'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{player.specialization || 'N/A'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-xs text-gray-500">
                                  <div>{player.battingStyle || 'N/A'}</div>
                                  {player.battingAverage > 0 && (
                                    <div>Avg: {player.battingAverage.toFixed(2)}</div>
                                  )}
                                  {player.strikeRate > 0 && (
                                    <div>SR: {player.strikeRate.toFixed(2)}</div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-xs text-gray-500">
                                  <div>{player.ballingType || 'N/A'}</div>
                                  {player.ballingAverage > 0 && (
                                    <div>Avg: {player.ballingAverage.toFixed(2)}</div>
                                  )}
                                  {player.economy > 0 && (
                                    <div>Econ: {player.economy.toFixed(2)}</div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                  ${player.status === 'sold' ? 'bg-green-100 text-green-800' : 
                                   player.status === 'unsold' ? 'bg-red-100 text-red-800' : 
                                   'bg-blue-100 text-blue-800'}`}>
                                  {player.status || 'available'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {player.status === 'sold' ? (player.soldToTeam || '-') : '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                {player.status === 'sold' ? (
                                  <span className="text-green-600 font-medium">{formatIndianRupee(player.soldAmount || 0)}</span>
                                ) : (
                                  <span className="text-gray-500">{formatIndianRupee(player.basePrice || 0)}</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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