// src/pages/AuctionPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AuctionRoom from '../components/auction/AuctionRoom';
import TeamList from '../components/teams/TeamList';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import { getAuctionSettings } from '../services/auctionService';
import { formatDate } from '../utils/formatters';
import { useNotification } from '../context/NotificationContext';

const AuctionPage = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { showInfo, showError } = useNotification();
  
  const [selectedTeamId, setSelectedTeamId] = useState(teamId || null);
  const [auctionDate, setAuctionDate] = useState(null);
  const [auctionActive, setAuctionActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Load auction settings when page loads
  useEffect(() => {
    const fetchAuctionSettings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const settings = await getAuctionSettings().catch(err => {
          console.error('Error fetching auction settings:', err);
          return null;
        });
        
        if (settings) {
          // Handle auction date
          if (settings.auctionDate) {
            const date = settings.auctionDate.toDate ? 
                        settings.auctionDate.toDate() : 
                        new Date(settings.auctionDate);
            setAuctionDate(date);
          }
          
          // Set current auction status
          setAuctionActive(settings.isActive || false);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching auction settings:', err);
        setError('Failed to load auction information. Please try again.');
        setLoading(false);
      }
    };
    
    fetchAuctionSettings();
  }, []);

  // Set team ID from URL params if provided
  useEffect(() => {
    if (teamId) {
      setSelectedTeamId(teamId);
    }
  }, [teamId]);

  // Handle team selection
  const handleSelectTeam = (team) => {
    setSelectedTeamId(team.id);
    navigate(`/auction/${team.id}`);
    showInfo(`You've selected ${team.name} for the auction`);
  };

  // Handle change team
  const handleChangeTeam = () => {
    setSelectedTeamId(null);
    navigate('/auction');
  };

  // Check if auction date is in the past
  const isAuctionPast = auctionDate && new Date() > auctionDate;
  
  // Check if auction date is today
  const isAuctionToday = auctionDate && (
    new Date().toDateString() === auctionDate.toDateString()
  );

  if (loading) {
    return (
      <MainLayout>
        <Loading text="Loading auction information..." />
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

  return (
    <MainLayout>
      {!selectedTeamId ? (
        // Team Selection Screen
        <div className="space-y-6">
          <Card
            title="Live Cricket Auction"
            titleVariant="primary"
          >
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Select Your Team</h2>
              <p className="text-gray-600 mb-6">
                Choose the team you want to represent during the auction. You will be able to place bids
                and manage your team's wallet.
              </p>
              
              {/* Auction Status */}
              {auctionActive ? (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-3 w-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    <p className="text-green-700 font-medium">
                      Auction is LIVE! Select a team to join now.
                    </p>
                  </div>
                </div>
              ) : auctionDate && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-700 font-medium">
                    {isAuctionPast 
                      ? 'The auction has already taken place.' 
                      : isAuctionToday 
                        ? 'Auction scheduled for today: ' 
                        : 'Auction scheduled for: '}
                    {!isAuctionPast && (
                      <span className="font-bold">
                        {formatDate(auctionDate, {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    )}
                  </p>
                  
                  {isAuctionPast && (
                    <div className="mt-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate('/results')}
                      >
                        View Auction Results
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
          
          <TeamList 
            onSelectTeam={handleSelectTeam} 
            showCreateButton={false}
            emptyMessage="No teams available. Please create teams in the Admin Panel."
          />
        </div>
      ) : (
        // Auction Room
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Live Auction Room</h1>
            <Button
              variant="outline"
              onClick={handleChangeTeam}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              }
            >
              Change Team
            </Button>
          </div>
          
          {auctionActive ? (
            <AuctionRoom teamId={selectedTeamId} />
          ) : (
            <Card>
              <div className="p-6 text-center">
                <svg 
                  className="mx-auto h-16 w-16 text-gray-400" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  {isAuctionPast ? 'Auction has ended' : 'Auction not active yet'}
                </h3>
                
                <p className="mt-2 text-gray-600">
                  {isAuctionPast 
                    ? 'The auction has already taken place. You can view the results.' 
                    : auctionDate 
                      ? `The auction is scheduled for ${formatDate(auctionDate)}. Please check back then.`
                      : 'Please wait for the auction to be started by the administrator.'}
                </p>
                
                <div className="mt-6">
                  {isAuctionPast ? (
                    <Button
                      variant="primary"
                      onClick={() => navigate('/results')}
                    >
                      View Auction Results
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={handleChangeTeam}
                    >
                      Change Team
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </MainLayout>
  );
};

export default AuctionPage;