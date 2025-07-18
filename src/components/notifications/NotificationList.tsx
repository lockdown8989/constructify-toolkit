
import React from 'react';
import { Bell } from 'lucide-react';
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
      <div className="py-12 text-center text-muted-foreground">
        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="text-sm">Loading notifications...</p>
      </div>
    );
  }
  
  if (notifications.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <Bell className="w-8 h-8 mx-auto mb-3 opacity-50" />
        <p className="text-sm font-medium mb-1">No notifications</p>
        <p className="text-xs">You're all caught up!</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {notifications.map((notification, index) => (
        <div 
          key={notification.id}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <NotificationItem
            notification={notification}
            onClick={onMarkAsRead}
          />
        </div>
      ))}
    </div>
  );
};

export default NotificationList;
