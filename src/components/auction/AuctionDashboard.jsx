import React, { useState, useEffect } from 'react';
import { playerService } from '../services/playerService';
import { teamService } from '../services/teamService';
import { auctionService } from '../services/auctionService';

const AuctionDashboard = () => {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch auction-related data
  useEffect(() => {
    const fetchAuctionData = async () => {
      try {
        setLoading(true);
        const [fetchedPlayers, fetchedTeams, fetchedAuctions] = await Promise.all([
          playerService.getAllPlayers(),
          teamService.getAllTeams(),
          auctionService.getAllAuctions()
        ]);

        setPlayers(fetchedPlayers);
        setTeams(fetchedTeams);
        setAuctions(fetchedAuctions);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch auction data');
        setLoading(false);
      }
    };

    fetchAuctionData();
  }, []);

  // Auction statistics
  const auctionStats = {
    totalPlayers: players.length,
    availablePlayers: players.filter(p => p.status === 'available').length,
    soldPlayers: players.filter(p => p.status === 'sold').length,
    unsoldPlayers: players.filter(p => p.status === 'unsold').length,
    totalTeams: teams.length,
    activeAuctions: auctions.filter(a => a.status === 'active').length,
    completedAuctions: auctions.filter(a => a.status === 'completed').length
  };

  // Player categories breakdown
  const playerCategories = players.reduce((acc, player) => {
    acc[player.category] = (acc[player.category] || 0) + 1;
    return acc;
  }, {});

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
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Auction Dashboard
      </h1>

      {/* Auction Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {[
          { 
            title: 'Total Players', 
            value: auctionStats.totalPlayers,
            color: 'bg-blue-100 text-blue-600'
          },
          { 
            title: 'Available Players', 
            value: auctionStats.availablePlayers,
            color: 'bg-green-100 text-green-600'
          },
          { 
            title: 'Sold Players', 
            value: auctionStats.soldPlayers,
            color: 'bg-yellow-100 text-yellow-600'
          },
          { 
            title: 'Unsold Players', 
            value: auctionStats.unsoldPlayers,
            color: 'bg-red-100 text-red-600'
          },
          { 
            title: 'Total Teams', 
            value: auctionStats.totalTeams,
            color: 'bg-purple-100 text-purple-600'
          },
          { 
            title: 'Active Auctions', 
            value: auctionStats.activeAuctions,
            color: 'bg-indigo-100 text-indigo-600'
          }
        ].map((stat, index) => (
          <div 
            key={index} 
            className={`${stat.color} p-6 rounded-lg shadow-md flex items-center justify-between`}
          >
            <div>
              <h3 className="text-lg font-semibold mb-2">{stat.title}</h3>
              <p className="text-3xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Player Categories */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Player Categories
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(playerCategories).map(([category, count]) => (
            <div 
              key={category} 
              className="bg-gray-100 rounded-lg p-4 text-center"
            >
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {category}
              </h3>
              <p className="text-2xl font-bold text-gray-800">{count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Auctions */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Recent Auctions
        </h2>
        {auctions.length === 0 ? (
          <p className="text-gray-600 text-center">No auctions yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 text-gray-600">
                  <th className="p-3 text-left">Auction ID</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Start Time</th>
                  <th className="p-3 text-left">End Time</th>
                </tr>
              </thead>
              <tbody>
                {auctions.map((auction) => (
                  <tr key={auction.id} className="border-b">
                    <td className="p-3">{auction.id}</td>
                    <td className="p-3">
                      <span className={`
                        px-2 py-1 rounded text-xs font-semibold
                        ${auction.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                        }
                      `}>
                        {auction.status}
                      </span>
                    </td>
                    <td className="p-3">
                      {auction.startTime 
                        ? new Date(auction.startTime.seconds * 1000).toLocaleString() 
                        : 'N/A'}
                    </td>
                    <td className="p-3">
                      {auction.endTime 
                        ? new Date(auction.endTime.seconds * 1000).toLocaleString() 
                        : 'Ongoing'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuctionDashboard;