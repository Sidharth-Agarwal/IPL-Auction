// src/pages/AuctionPage.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/common/Header';
import AuctionRoom from '../components/auction/AuctionRoom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { getAllTeams } from '../services/teamService';

const AuctionPage = () => {
  const { teamId } = useParams();
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState(teamId || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load teams on initial render
  useEffect(() => {
    const loadTeams = async () => {
      try {
        setLoading(true);
        const teamsData = await getAllTeams();
        setTeams(teamsData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load teams');
        setLoading(false);
        console.error(err);
      }
    };
    
    loadTeams();
  }, []);

  // Set team ID from URL params if provided
  useEffect(() => {
    if (teamId) {
      setSelectedTeamId(teamId);
    }
  }, [teamId]);

  return (
    <div>
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {!selectedTeamId ? (
          // Team Selection Screen
          <div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
              <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-6">
                <h1 className="text-3xl font-bold">Live Cricket Auction</h1>
                <p className="text-blue-100">
                  Select your team to participate in the auction
                </p>
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
                <p>{error}</p>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Select Your Team</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {teams.map(team => (
                    <Card key={team.id} className="hover:shadow-lg transition-shadow">
                      <div className="p-6">
                        <div className="flex items-center mb-4">
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
                        
                        <div className="flex justify-between mb-4">
                          <span className="text-gray-600">Wallet Balance:</span>
                          <span className="font-bold text-green-600">${team.wallet.toLocaleString()}</span>
                        </div>
                        
                        <Button
                          variant="primary"
                          onClick={() => setSelectedTeamId(team.id)}
                          fullWidth
                        >
                          Select Team
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
                
                {teams.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No teams available. Please create teams in the Admin Panel.</p>
                    <Button variant="primary" onClick={() => window.location.href = '/admin'}>
                      Go to Admin Panel
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          // Auction Room
          <div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
              <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-6">
                <h1 className="text-3xl font-bold">Live Cricket Auction</h1>
                <p className="text-blue-100">
                  Bid on players to build your dream team
                </p>
              </div>
            </div>
            
            <AuctionRoom teamId={selectedTeamId} />
            
            <div className="mt-8 text-center">
              <Button
                variant="secondary"
                onClick={() => setSelectedTeamId(null)}
              >
                Change Team
              </Button>
            </div>
          </div>
        )}
      </main>
      
      <footer className="bg-gray-800 text-white mt-12 py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} Cricket Auction App. All rights reserved.</p>
          <p className="text-gray-400 text-sm mt-2">
            Live Auction Room
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AuctionPage;