import React, { useState, useEffect } from 'react';
import { playerService } from '../services/playerService';
import { teamService } from '../services/teamService';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPlayers: 0,
    totalTeams: 0,
    availablePlayers: 0,
    soldPlayers: 0,
    totalWallet: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch players and teams
        const players = await playerService.getAllPlayers();
        const teams = await teamService.getAllTeams();

        // Calculate statistics
        const availablePlayers = players.filter(p => p.status === 'available');
        const soldPlayers = players.filter(p => p.status === 'sold');
        
        // Calculate total team wallet
        const totalWallet = teams.reduce((total, team) => total + (team.wallet || 0), 0);

        setStats({
          totalPlayers: players.length,
          totalTeams: teams.length,
          availablePlayers: availablePlayers.length,
          soldPlayers: soldPlayers.length,
          totalWallet
        });

        setLoading(false);
      } catch (err) {
        setError('Failed to fetch dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Quick action buttons
  const quickActions = [
    {
      title: 'Import Players',
      icon: '📥',
      description: 'Add new players to the auction',
      onClick: () => window.location.href = '/players?tab=import'
    },
    {
      title: 'Create Team',
      icon: '🏆',
      description: 'Create a new team for the auction',
      onClick: () => window.location.href = '/teams?tab=create'
    },
    {
      title: 'Start Auction',
      icon: '🔨',
      description: 'Begin the player auction process',
      onClick: () => window.location.href = '/auction'
    }
  ];

  // Dashboard statistics cards
  const statisticsCards = [
    {
      title: 'Total Players',
      value: stats.totalPlayers,
      icon: '👥',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Available Players',
      value: stats.availablePlayers,
      icon: '🟢',
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'Sold Players',
      value: stats.soldPlayers,
      icon: '💰',
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      title: 'Total Teams',
      value: stats.totalTeams,
      icon: '🏅',
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl text-red-600 mb-4">Error</h2>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Welcome, {user?.email || 'Admin'}
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statisticsCards.map((card, index) => (
          <div 
            key={index} 
            className={`${card.color} p-6 rounded-lg shadow-md flex items-center justify-between`}
          >
            <div>
              <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
              <p className="text-3xl font-bold">{card.value}</p>
            </div>
            <span className="text-4xl">{card.icon}</span>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <div 
              key={index}
              onClick={action.onClick}
              className="bg-white border border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1"
            >
              <div className="text-5xl mb-4">{action.icon}</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {action.title}
              </h3>
              <p className="text-gray-600">
                {action.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Insights */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Auction Insights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Total Team Wallet
            </h3>
            <p className="text-3xl font-bold text-green-600">
              ₹{stats.totalWallet.toLocaleString()}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Auction Status
            </h3>
            <p className="text-xl text-gray-600">
              {stats.availablePlayers > 0 
                ? `${stats.availablePlayers} Players Remaining` 
                : 'Auction Completed'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;