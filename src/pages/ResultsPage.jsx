// src/pages/ResultsPage.jsx
import React from 'react';
import Layout from '../components/common/Layout';
import ResultsView from '../components/auction/ResultsView';

const ResultsPage = () => {
  return (
    <Layout title="Auction Results">
      <ResultsView />
    </Layout>
  );
};

export default ResultsPage;