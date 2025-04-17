
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import type { Notification } from '@/hooks/use-notifications';

interface NotificationItemProps {
  notification: Notification;
  onClick: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClick }) => {
  const getNotificationTimeAgo = (createdAt: string) => {
    try {
      return formatDistanceToNow(new Date(createdAt), { addSuffix: true });
    } catch (error) {
      return 'recently';
    }
  };
  
  const getNotificationBgColor = (type: string, read: boolean) => {
    if (read) return '';
    
    switch (type) {
      case 'success':
        return 'bg-green-50';
      case 'warning':
        return 'bg-yellow-50';
      case 'error':
        return 'bg-red-50';
      case 'info':
      default:
        return 'bg-blue-50';
    }
  };

  return (
    <div 
      className={`p-4 border-b hover:bg-muted/50 cursor-pointer ${getNotificationBgColor(notification.type, notification.read)}`}
      onClick={() => onClick(notification.id)}
    >
      <div className="flex justify-between items-start">
        <p className="font-medium">{notification.title}</p>
        <span className="text-xs text-muted-foreground">
          {getNotificationTimeAgo(notification.created_at)}
        </span>
      </div>
      <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
    </div>
  );
};

export default NotificationItem;
