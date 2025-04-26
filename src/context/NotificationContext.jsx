// src/context/NotificationContext.jsx
import React, { createContext, useState, useCallback, useContext } from 'react';
import PropTypes from 'prop-types';
import { DEFAULT_SETTINGS } from '../utils/constants';

// Create context
export const NotificationContext = createContext(null);

// Notification provider component
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Add a notification
  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 5);
    const newNotification = {
      id,
      message: notification.message || 'Notification',
      type: notification.type || 'info',
      duration: notification.duration || DEFAULT_SETTINGS.NOTIFICATION_TIMEOUT,
      position: notification.position || 'top-right',
      ...notification
    };

    setNotifications(prevNotifications => [...prevNotifications, newNotification]);

    // Auto-dismiss notification after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  // Remove a notification by id
  const removeNotification = useCallback((id) => {
    setNotifications(prevNotifications => 
      prevNotifications.filter(notification => notification.id !== id)
    );
  }, []);

  // Shorthand methods for different notification types
  const showSuccess = useCallback((message, options = {}) => {
    return addNotification({ message, type: 'success', ...options });
  }, [addNotification]);

  const showError = useCallback((message, options = {}) => {
    return addNotification({ message, type: 'error', ...options });
  }, [addNotification]);

  const showInfo = useCallback((message, options = {}) => {
    return addNotification({ message, type: 'info', ...options });
  }, [addNotification]);

  const showWarning = useCallback((message, options = {}) => {
    return addNotification({ message, type: 'warning', ...options });
  }, [addNotification]);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Context value
  const value = {
    notifications,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    clearNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

NotificationProvider.propTypes = {
  children: PropTypes.node.isRequired
};

// Custom hook to use the notification context
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;