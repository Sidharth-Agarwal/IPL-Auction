// src/pages/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import Header from '../components/common/Header';

const HomePage = () => {
  return (
    <div>
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-lg shadow-lg overflow-hidden mb-10">
          <div className="md:flex">
            <div className="p-8 md:p-12 md:w-3/5">
              <h1 className="text-4xl font-bold mb-4">Office Cricket Auction</h1>
              <p className="text-xl text-blue-100 mb-6">
                Live bidding platform for your office cricket tournament. Create teams, 
                import players, and auction them in real-time.
              </p>
              <div className="space-x-4">
                <Link to="/auction">
                  <Button variant="primary" size="lg">
                    Join Auction
                  </Button>
                </Link>
                <Link to="/admin">
                  <Button variant="secondary" size="lg">
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
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <svg 
                  className="w-6 h-6 text-blue-700" 
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
              <p className="text-gray-600">
                Set up teams with initial wallet balances. Each team can bid on players
                during the auction process.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <svg 
                  className="w-6 h-6 text-green-700" 
                  fill="currentColor" 
                  viewBox="0 0 20 20" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Import Players</h3>
              <p className="text-gray-600">
                Easily import player data from CSV or Excel files. Add player details,
                stats, and base prices for auction.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <svg 
                  className="w-6 h-6 text-yellow-700" 
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
              <p className="text-gray-600">
                Conduct live auctions with real-time bidding. See bids update instantly
                and track team wallet balances.
              </p>
            </div>
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="bg-gray-100 p-8 rounded-lg text-center">
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
        </div>
      </main>
      
      <footer className="bg-gray-800 text-white mt-12 py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} Cricket Auction App. All rights reserved.</p>
          <p className="text-gray-400 text-sm mt-2">
            Built with React, Firebase, and Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;