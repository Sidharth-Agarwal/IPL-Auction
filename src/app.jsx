// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Pages
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import AuctionPage from './pages/AuctionPage';
import ResultsPage from './pages/ResultsPage';

// Context Providers
import { AuctionProvider } from './context/AuctionContext';
// import { TeamProvider } from './context/TeamContext';

function App() {
  return (
    <Router>
      <AuctionProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/auction" element={<AuctionPage />} />
            <Route path="/auction/:teamId" element={<AuctionPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/teams/:teamId" element={<AuctionPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </AuctionProvider>
    </Router>
  );
}

export default App;