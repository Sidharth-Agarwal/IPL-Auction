// src/pages/HomePage.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { getAuctionSettings } from '../services/auctionService';
import { formatDate } from '../utils/formatters';

const HomePage = () => {
  const [auctionDate, setAuctionDate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch auction date
  useEffect(() => {
    const fetchAuctionSettings = async () => {
      try {
        setIsLoading(true);
        const settings = await getAuctionSettings();
        if (settings && settings.auctionDate) {
          // Handle Firebase Timestamp
          const date = settings.auctionDate.toDate ? 
                      settings.auctionDate.toDate() : 
                      new Date(settings.auctionDate);
          setAuctionDate(date);
        }
      } catch (error) {
        console.error('Error fetching auction settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuctionSettings();
  }, []);

  const isAuctionSoon = auctionDate && (auctionDate.getTime() - Date.now()) < 7 * 24 * 60 * 60 * 1000; // 7 days

  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-lg shadow-lg overflow-hidden mb-10">
        <div className="md:flex">
          <div className="p-8 md:p-12 md:w-3/5">
            <h1 className="text-4xl font-bold mb-4">Office Cricket Auction</h1>
            <p className="text-xl text-blue-100 mb-6">
              Live bidding platform for your office cricket tournament. Create teams, 
              import players, and auction them in real-time.
            </p>
            
            {auctionDate && (
              <div className="bg-blue-800 bg-opacity-50 rounded-lg p-4 mb-6">
                <p className="text-lg font-medium">
                  Auction scheduled for:
                </p>
                <p className="text-xl font-bold">
                  {formatDate(auctionDate, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}
            
            <div className="space-x-4">
              <Link to="/auction">
                <Button 
                  variant="primary" 
                  size="lg"
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                >
                  Join Auction
                </Button>
              </Link>
              <Link to="/admin">
                <Button 
                  variant="secondary" 
                  size="lg"
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  }
                >
                  Admin Panel
                </Button>
              </Link>
            </div>
          </div>
          <div className="md:w-2/5 bg-blue-800 flex items-center justify-center p-8">
            <div className="text-center">
              <svg 
                className="w-24 h-24 mx-auto text-blue-300" 
                fill="currentColor" 
                viewBox="0 0 20 20" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" 
                  clipRule="evenodd" 
                />
              </svg>
              <p className="text-blue-100 text-lg mt-4">LIVE Auction</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">How It Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <Card className="bg-white p-6 transition-transform hover:scale-105">
            <div className="flex flex-col items-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <svg 
                  className="w-8 h-8 text-blue-700" 
                  fill="currentColor" 
                  viewBox="0 0 20 20" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" 
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Create Teams</h3>
              <p className="text-gray-600 text-center">
                Set up teams with initial wallet balances. Each team can bid on players
                during the auction process.
              </p>
              <div className="mt-6">
                <Link to="/admin?tab=teams">
                  <Button variant="outline" size="sm">Create Teams</Button>
                </Link>
              </div>
            </div>
          </Card>
          
          {/* Feature 2 */}
          <Card className="bg-white p-6 transition-transform hover:scale-105">
            <div className="flex flex-col items-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <svg 
                  className="w-8 h-8 text-green-700" 
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
              <h3 className="text-xl font-bold text-gray-800 mb-2">Import Players</h3>
              <p className="text-gray-600 text-center">
                Easily import player data from CSV or Excel files. Add player details,
                stats, and base prices for auction.
              </p>
              <div className="mt-6">
                <Link to="/admin?tab=players">
                  <Button variant="outline" size="sm">Import Players</Button>
                </Link>
              </div>
            </div>
          </Card>
          
          {/* Feature 3 */}
          <Card className="bg-white p-6 transition-transform hover:scale-105">
            <div className="flex flex-col items-center">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <svg 
                  className="w-8 h-8 text-yellow-700" 
                  fill="currentColor" 
                  viewBox="0 0 20 20" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Real-Time Auction</h3>
              <p className="text-gray-600 text-center">
                Conduct live auctions with real-time bidding. See bids update instantly
                and track team wallet balances.
              </p>
              <div className="mt-6">
                <Link to="/auction">
                  <Button variant="outline" size="sm">Join Auction</Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      {/* Call to Action Section */}
      {isAuctionSoon && (
        <Card className="bg-blue-50 border border-blue-200 p-8 text-center mb-10">
          <h2 className="text-2xl font-bold text-blue-800 mb-4">
            The auction is coming soon!
          </h2>
          <p className="text-blue-700 mb-6 text-lg">
            Don't miss the chance to participate in our Cricket Auction on{' '}
            <span className="font-bold">
              {formatDate(auctionDate, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/teams">
              <Button variant="primary">
                View Teams
              </Button>
            </Link>
            <Link to="/auction">
              <Button variant="success">
                Join Auction
              </Button>
            </Link>
          </div>
        </Card>
      )}
      
      {/* Regular CTA Section */}
      {!isAuctionSoon && (
        <Card className="bg-gray-100 p-8 text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Ready to start your auction?</h2>
          <p className="text-gray-600 mb-6">
            Join the auction or set up teams and players as an admin.
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/auction">
              <Button variant="primary">
                Join Auction
              </Button>
            </Link>
            <Link to="/admin">
              <Button variant="secondary">
                Admin Panel
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </MainLayout>
  );
};

export default HomePage;