// src/pages/NotFoundPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Button from '../components/common/Button';

const NotFoundPage = () => {
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center py-16">
        <div className="text-center">
          <h1 className="text-9xl font-bold text-blue-600">404</h1>
          <h2 className="text-3xl font-semibold text-gray-800 mt-4">Page Not Found</h2>
          <p className="text-gray-600 mt-4 max-w-md mx-auto">
            The page you are looking for might have been removed, had its name changed, 
            or is temporarily unavailable.
          </p>
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
      </div>
    </MainLayout>
  );
};

export default NotFoundPage;