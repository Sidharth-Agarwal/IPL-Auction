// src/pages/TeamsPage.jsx
import React from 'react';
import Layout from '../components/common/Layout';
import TeamList from '../components/teams/TeamList';

const TeamsPage = () => {
  return (
    <Layout title="Teams Management">
      <TeamList />
    </Layout>
  );
};

export default TeamsPage;