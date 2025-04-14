
import React from 'react';
import { Button } from '@/components/ui/button';

interface NotificationHeaderProps {
  unreadCount: number;
  isLoading: boolean;
  onMarkAllAsRead: () => void;
}

const NotificationHeader = ({
  unreadCount,
  isLoading,
  onMarkAllAsRead
}: NotificationHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <h3 className="font-medium">Notifications</h3>
      {unreadCount > 0 && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onMarkAllAsRead}
          disabled={isLoading}
          className="text-xs"
        >
          {isLoading ? "Processing..." : "Mark all as read"}
        </Button>
      )}
    </div>
  );
};

export default NotificationHeader;
