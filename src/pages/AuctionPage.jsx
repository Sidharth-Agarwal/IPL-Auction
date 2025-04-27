// src/pages/AuctionPage.jsx
import React from 'react';
import Layout from '../components/common/Layout';
import AuctionControl from '../components/auction/AuctionControl';

const AuctionPage = () => {
  return (
    <Layout title="Auction Room">
      <AuctionControl />
    </Layout>
  );
};

export default AuctionPage;