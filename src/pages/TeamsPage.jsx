// src/pages/TeamsPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import TeamList from '../components/teams/TeamList';
import Card from '../components/common/Card';

const TeamsPage = () => {
  const navigate = useNavigate();
  
  // Handle team selection
  const handleViewTeam = (team) => {
    navigate(`/teams/${team.id}`);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <Card
          title="Teams"
          titleVariant="primary"
          subtitle="View all teams participating in the auction"
        >
          <div className="p-6">
            <p className="text-gray-600">
              Here you can see all the teams that will be participating in the cricket auction.
              View team details, players already acquired, and remaining wallet balance.
            </p>
          </div>
        </Card>
        
        {/* Team List */}
        <TeamList 
          onSelectTeam={handleViewTeam}
          showCreateButton={false}
        />
      </div>
    </MainLayout>
  );
};

export default TeamsPage;