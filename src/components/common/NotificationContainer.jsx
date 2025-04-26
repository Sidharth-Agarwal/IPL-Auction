// src/components/common/NotificationContainer.jsx
import React from 'react';
import { createPortal } from 'react-dom';
import { useNotification } from '../../context/NotificationContext';
import Notification from './Notification';

// Group notifications by position
const groupByPosition = (notifications) => {
  return notifications.reduce((acc, notification) => {
    const position = notification.position || 'top-right';
    if (!acc[position]) {
      acc[position] = [];
    }
    acc[position].push(notification);
    return acc;
  }, {});
};

// Position classes for container placement
const positionClasses = {
  'top-right': 'top-4 right-4 flex-col items-end',
  'top-left': 'top-4 left-4 flex-col items-start',
  'bottom-right': 'bottom-4 right-4 flex-col-reverse items-end',
  'bottom-left': 'bottom-4 left-4 flex-col-reverse items-start',
  'top-center': 'top-4 left-1/2 transform -translate-x-1/2 flex-col items-center',
  'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2 flex-col-reverse items-center'
};

const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotification();
  
  if (notifications.length === 0) return null;
  
  const notificationsByPosition = groupByPosition(notifications);

  return createPortal(
    <>
      {Object.entries(notificationsByPosition).map(([position, positionNotifications]) => (
        <div 
          key={position}
          className={`fixed z-50 flex space-y-2 ${positionClasses[position] || positionClasses['top-right']}`}
          style={{ maxWidth: '90vw' }}
        >
          {positionNotifications.map(notification => (
            <Notification
              key={notification.id}
              id={notification.id}
              type={notification.type}
              message={notification.message}
              title={notification.title}
              onClose={() => removeNotification(notification.id)}
            />
          ))}
        </div>
      ))}
    </>,
    document.body
  );
};

export default NotificationContainer;