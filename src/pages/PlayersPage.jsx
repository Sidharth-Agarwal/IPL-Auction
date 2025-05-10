// src/pages/PlayersPage.jsx
import React from 'react';
import Layout from '../components/common/Layout';
import PlayerList from '../components/players/PlayerList';

const PlayersPage = () => {
  return (
    <Layout title="ADA PREMIERE LEAGUE">
      <PlayerList />
    </Layout>
  );
};

export default PlayersPage;