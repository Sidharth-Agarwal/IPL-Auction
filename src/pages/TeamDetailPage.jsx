// src/pages/TeamDetailPage.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import TeamDetail from '../components/teams/TeamDetail';
import ErrorMessage from '../components/common/ErrorMessage';
import Loading from '../components/common/Loading';

const TeamDetailPage = () => {
  const { teamId } = useParams();
  
  if (!teamId) {
    return (
      <MainLayout>
        <ErrorMessage 
          message="No team ID provided. Please select a team from the teams page." 
          variant="warning"
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <TeamDetail teamId={teamId} />
    </MainLayout>
  );
};

export default TeamDetailPage;