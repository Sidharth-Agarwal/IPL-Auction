// src/components/admin/AdminPanel.js
import React, { useState, useEffect } from 'react';
import { getAllTeams } from '../../services/teamService';
import { getAllPlayers, getPlayersByStatus } from '../../services/playerService';
import { getAuctionSettings } from '../../services/auctionService';
import Card from '../common/Card';
import Button from '../common/Button';

const AdminPanel = () => {
  const [teamStats, setTeamStats] = useState({
    total: 0,
    totalWallet: 0
  });
  const [playerStats, setPlayerStats] = useState({
    total: 0,
    available: 0,
    sold: 0,
    unsold: 0
  });
  const [auctionStatus, setAuctionStatus] = useState({
    isActive: false,
    currentPlayer: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch teams data
        const teams = await getAllTeams();
        const totalWallet = teams.reduce((sum, team) => sum + team.wallet, 0);
        setTeamStats({
          total: teams.length,
          totalWallet
        });
        
        // Fetch player stats
        const allPlayers = await getAllPlayers();
        const availablePlayers = await getPlayersByStatus('available');
        const soldPlayers = await getPlayersByStatus('sold');
        const unsoldPlayers = await getPlayersByStatus('unsold');
        
        setPlayerStats({
          total: allPlayers.length,
          available: availablePlayers.length,
          sold: soldPlayers.length,
          unsold: unsoldPlayers.length
        });
        
        // Fetch auction status
        const settings = await getAuctionSettings();
        setAuctionStatus({
          isActive: settings?.isActive || false,
          currentPlayer: settings?.currentPlayerId || null
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
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

  return (
    <div className="space-y-6">
      {/* Overview Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Teams Card */}
        <Card className="bg-blue-50">
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-200 text-blue-800 mr-4">
                <svg 
                  className="w-8 h-8" 
                  fill="currentColor" 
                  viewBox="0 0 20 20" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" 
                  />
                </svg>
              </div>
              <div>
                <p className="text-blue-800 text-sm font-medium">Total Teams</p>
                <p className="text-blue-900 text-2xl font-bold">{teamStats.total}</p>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Players Card */}
        <Card className="bg-green-50">
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-200 text-green-800 mr-4">
                <svg 
                  className="w-8 h-8" 
                  fill="currentColor" 
                  viewBox="0 0 20 20" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </div>
              <div>
                <p className="text-green-800 text-sm font-medium">Total Players</p>
                <p className="text-green-900 text-2xl font-bold">{playerStats.total}</p>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Total Budget Card */}
        <Card className="bg-yellow-50">
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-200 text-yellow-800 mr-4">
                <svg 
                  className="w-8 h-8" 
                  fill="currentColor" 
                  viewBox="0 0 20 20" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </div>
              <div>
                <p className="text-yellow-800 text-sm font-medium">Total Budget</p>
                <p className="text-yellow-900 text-2xl font-bold">${teamStats.totalWallet.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Auction Status Card */}
        <Card className={auctionStatus.isActive ? "bg-green-50" : "bg-red-50"}>
          <div className="p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${auctionStatus.isActive ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"} mr-4`}>
                <svg 
                  className="w-8 h-8" 
                  fill="currentColor" 
                  viewBox="0 0 20 20" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </div>
              <div>
                <p className={`text-sm font-medium ${auctionStatus.isActive ? "text-green-800" : "text-red-800"}`}>
                  Auction Status
                </p>
                <p className={`text-2xl font-bold ${auctionStatus.isActive ? "text-green-900" : "text-red-900"}`}>
                  {auctionStatus.isActive ? "Active" : "Inactive"}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Player Status Section */}
      <Card title="Player Status">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-blue-700 text-sm font-medium">Available Players</p>
              <p className="text-blue-900 text-3xl font-bold">{playerStats.available}</p>
              <p className="text-blue-600 text-sm">
                {playerStats.total > 0 
                  ? `${Math.round((playerStats.available / playerStats.total) * 100)}% of total`
                  : '0% of total'}
              </p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-green-700 text-sm font-medium">Sold Players</p>
              <p className="text-green-900 text-3xl font-bold">{playerStats.sold}</p>
              <p className="text-green-600 text-sm">
                {playerStats.total > 0 
                  ? `${Math.round((playerStats.sold / playerStats.total) * 100)}% of total`
                  : '0% of total'}
              </p>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <p className="text-yellow-700 text-sm font-medium">Unsold Players</p>
              <p className="text-yellow-900 text-3xl font-bold">{playerStats.unsold}</p>
              <p className="text-yellow-600 text-sm">
                {playerStats.total > 0 
                  ? `${Math.round((playerStats.unsold / playerStats.total) * 100)}% of total`
                  : '0% of total'}
              </p>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Quick Actions */}
      <Card title="Quick Actions">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="primary" 
              onClick={() => window.location.href = '/admin?tab=teams'}
            >
              Add New Team
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => window.location.href = '/admin?tab=players'}
            >
              Import Players
            </Button>
            <Button 
              variant="success" 
              onClick={() => window.location.href = '/admin?tab=auction'}
            >
              Manage Auction
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminPanel;