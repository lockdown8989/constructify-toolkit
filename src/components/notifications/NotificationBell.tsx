
import React, { useState } from 'react';
import { Bell, BellRing } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useNotifications } from '@/hooks/use-notifications';
import { useIsMobile } from '@/hooks/use-mobile';
import NotificationList from './NotificationList';

const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative hover:bg-muted transition-colors"
        >
          {unreadCount > 0 ? (
            <BellRing className="h-5 w-5 text-primary animate-pulse" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-xs text-destructive-foreground flex items-center justify-center animate-bounce">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className={`${isMobile ? 'w-[95vw] max-w-sm' : 'w-80'} p-0 shadow-lg border`} 
        align="end"
        sideOffset={8}
      >
        <div className="flex items-center justify-between p-3 sm:p-4 border-b bg-muted/30">
          <h3 className="font-semibold text-sm sm:text-base">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              disabled={isLoading}
              className="text-xs h-auto px-2 py-1 hover:bg-muted"
            >
              {isLoading ? "Clearing..." : "Mark all read"}
            </Button>
          )}
        </div>
        <div className={`${isMobile ? 'max-h-[60vh]' : 'max-h-80'} overflow-y-auto`}>
          <NotificationList 
            notifications={notifications}
            isLoading={isLoading}
            onMarkAsRead={markAsRead}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
