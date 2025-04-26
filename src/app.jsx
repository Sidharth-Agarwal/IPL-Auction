// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Context Providers
import { AuctionProvider } from './context/AuctionContext';
import { NotificationProvider } from './context/NotificationContext';

// Pages
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import AuctionPage from './pages/AuctionPage';
import ResultsPage from './pages/ResultsPage';
import TeamsPage from './pages/TeamsPage';
import TeamDetailPage from './pages/TeamDetailPage';
import NotFoundPage from './pages/NotFoundPage';

// Components
import NotificationContainer from './components/common/NotificationContainer';

function App() {
  return (
    <Router>
      <NotificationProvider>
        <AuctionProvider>
          <NotificationContainer />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/auction" element={<AuctionPage />} />
            <Route path="/auction/:teamId" element={<AuctionPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/teams" element={<TeamsPage />} />
            <Route path="/teams/:teamId" element={<TeamDetailPage />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/:tab" element={<AdminPage />} />
            
            {/* Catch All */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuctionProvider>
      </NotificationProvider>
    </Router>
  );
}

export default App;