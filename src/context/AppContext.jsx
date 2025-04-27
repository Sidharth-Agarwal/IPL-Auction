// src/context/AppContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

// Create context
const AppContext = createContext();

// Create provider
export const AppProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  
  // Clear notifications after timeout
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (notifications.length > 0) {
        // Remove the oldest notification
        setNotifications(prevNotifications => prevNotifications.slice(1));
      }
    }, 5000);
    
    return () => clearTimeout(timeout);
  }, [notifications]);
  
  // Add a notification
  const addNotification = (type, message) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 5);
    setNotifications(prevNotifications => [
      ...prevNotifications,
      { id, type, message }
    ]);
    
    return id;
  };
  
  // Remove a notification by id
  const removeNotification = (id) => {
    setNotifications(prevNotifications => 
      prevNotifications.filter(notification => notification.id !== id)
    );
  };
  
  // Success notification
  const showSuccess = (message) => {
    return addNotification('success', message);
  };
  
  // Error notification
  const showError = (message) => {
    return addNotification('error', message);
  };
  
  // Info notification
  const showInfo = (message) => {
    return addNotification('info', message);
  };
  
  // Warning notification
  const showWarning = (message) => {
    return addNotification('warning', message);
  };
  
  // Set loading state
  const setLoading = (isLoading) => {
    setIsLoading(isLoading);
  };
  
  // Context value
  const value = {
    notifications,
    isLoading,
    user,
    setUser,
    setLoading,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    removeNotification
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the app context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;