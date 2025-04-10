
import React from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { WorkflowNotification } from '@/types/supabase';

interface NotificationItemProps {
  notification: WorkflowNotification;
  onMarkAsRead: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification, 
  onMarkAsRead 
}) => {
  const formattedDate = notification.created_at 
    ? format(new Date(notification.created_at), 'MMM d, h:mm a')
    : '';

  // Determine status color
  const getStatusColor = () => {
    switch (notification.status) {
      case 'approved':
        return 'text-green-500';
      case 'rejected':
        return 'text-red-500';
      case 'pending':
      default:
        return 'text-blue-500';
    }
  };

  return (
    <div 
      className={cn(
        "p-4 border-b hover:bg-muted/50 cursor-pointer",
        !notification.read && "bg-muted/20"
      )}
      onClick={onMarkAsRead}
    >
      <div className="flex justify-between items-start">
        <p className={cn("font-medium", getStatusColor())}>
          {notification.type}
        </p>
        <span className="text-xs text-muted-foreground">
          {formattedDate}
        </span>
      </div>
      <p className="text-sm text-muted-foreground mt-1">
        {notification.message}
      </p>
    </div>
  );
};

export default NotificationItem;
