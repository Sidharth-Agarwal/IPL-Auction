// src/pages/NotFoundPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/common/Layout';
import Button from '../components/common/Button';

const NotFoundPage = () => {
  return (
    <Layout title="Page Not Found">
      <div className="flex flex-col items-center justify-center py-12">
        <h1 className="text-9xl font-bold text-blue-500">404</h1>
        <p className="text-xl text-gray-600 mt-4">The page you're looking for doesn't exist.</p>
        <div className="mt-8">
          <Link to="/">
            <Button 
              variant="primary"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              }
            >
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default NotFoundPage;