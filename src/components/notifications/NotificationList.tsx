
import React from 'react';
import { type Notification } from '@/hooks/use-notifications';

interface NotificationListProps {
  notifications: Notification[];
  isLoading: boolean;
  onNotificationClick: (id: string) => void;
  getNotificationTimeAgo: (createdAt: string) => string;
  getNotificationBgColor: (type: string, read: boolean) => string;
}

const NotificationList = ({
  notifications,
  isLoading,
  onNotificationClick,
  getNotificationTimeAgo,
  getNotificationBgColor
}: NotificationListProps) => {
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
        <div 
          key={notification.id}
          className={`p-4 border-b hover:bg-muted/50 cursor-pointer ${getNotificationBgColor(notification.type, notification.read)}`}
          onClick={() => onNotificationClick(notification.id)}
        >
          <div className="flex justify-between items-start">
            <p className="font-medium">{notification.title}</p>
            <span className="text-xs text-muted-foreground">
              {getNotificationTimeAgo(notification.created_at)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
        </div>
      ))}
    </div>
  );
};

export default NotificationList;
