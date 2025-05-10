// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Context Providers
import { AppProvider } from './context/AppContext';

// Pages
import TeamsPage from './pages/TeamsPage';
import PlayersPage from './pages/PlayersPage';
import AuctionPage from './pages/AuctionPage';
import ResultsPage from './pages/ResultsPage';
import NotFoundPage from './pages/NotFoundPage';

// Components
import NotificationComponent from './components/common/NotificationComponent';

function App() {
  return (
    <Router>
      <AppProvider>
        <NotificationComponent />
        <Routes>
          {/* Main Routes */}
          <Route path="/" element={<PlayersPage />} />
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/players" element={<PlayersPage />} />
          <Route path="/auction" element={<AuctionPage />} />
          <Route path="/results" element={<ResultsPage />} />
          
          {/* Catch All */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AppProvider>
    </Router>
  );
}

export default App;