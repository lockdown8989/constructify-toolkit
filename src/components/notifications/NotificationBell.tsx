import React, { useState } from 'react';
import { Bell, BellRing } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useNotifications } from '@/hooks/use-notifications';
import NotificationHeader from './NotificationHeader';
import NotificationList from './NotificationList';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    getNotificationTimeAgo,
    getNotificationBgColor
  } = useNotifications();

  const handleNotificationClick = (id: string) => {
    markAsRead(id);
  };

  const handleBellClick = () => {
    // We'll keep the default behavior of toggling the popover
  };
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
          onClick={handleBellClick}
        >
          {unreadCount > 0 ? (
            <BellRing className="h-5 w-5 text-primary" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center transform translate-x-1 -translate-y-1">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <NotificationHeader 
          unreadCount={unreadCount}
          isLoading={isLoading}
          onMarkAllAsRead={markAllAsRead}
        />
        <NotificationList 
          notifications={notifications}
          isLoading={isLoading}
          onNotificationClick={handleNotificationClick}
          getNotificationTimeAgo={getNotificationTimeAgo}
          getNotificationBgColor={getNotificationBgColor}
        />
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
