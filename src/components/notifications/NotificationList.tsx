
import React from 'react';
import NotificationItem from './NotificationItem';
import type { Notification } from '@/hooks/use-notifications';

interface NotificationListProps {
  notifications: Notification[];
  isLoading: boolean;
  onMarkAsRead: (id: string) => void;
}

const NotificationList: React.FC<NotificationListProps> = ({ 
  notifications, 
  isLoading, 
  onMarkAsRead 
}) => {
  if (isLoading && notifications.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <p>Loading notifications...</p>
      </div>
    );
  }
  
  if (notifications.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <p>No notifications</p>
      </div>
    );
  }

  return (
    <div className="max-h-80 overflow-y-auto">
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClick={onMarkAsRead}
        />
      ))}
    </div>
  );
};

export default NotificationList;
