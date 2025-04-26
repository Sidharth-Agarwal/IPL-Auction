import React from 'react';
import { useAuth } from './context/AuthContext';
import AdminLogin from './components/auth/AdminLogin';
import Dashboard from './pages/Dashboard';

const App = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      {user ? <Dashboard /> : <AdminLogin />}
    </div>
  );
};

export default App;