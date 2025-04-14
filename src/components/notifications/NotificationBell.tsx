import React, { useState, useEffect } from 'react';
import { Bell, BellRing } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
  related_entity?: string;
  related_id?: string;
}

const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      console.log('NotificationBell: No user logged in, skipping notification setup');
      return;
    }

    console.log('NotificationBell: Setting up notifications for user', user.id);

    // Load initial notifications
    fetchNotifications();
    
    // Set up real-time listener for new notifications
    console.log('NotificationBell: Setting up real-time listener for notifications');
    const channel = supabase
      .channel('notification_updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('NotificationBell: New notification received:', payload);
          setNotifications(prevNotifications => [payload.new as Notification, ...prevNotifications]);
          setUnreadCount(prevCount => prevCount + 1);
          
          // Show a toast for the new notification
          toast({
            title: (payload.new as Notification).title,
            description: (payload.new as Notification).message,
          });
        }
      )
      .subscribe();
    
    console.log('NotificationBell: Subscribed to notification channel');
    
    return () => {
      console.log('NotificationBell: Cleaning up notification listener');
      supabase.removeChannel(channel);
    };
  }, [user, toast]);
  
  const fetchNotifications = async () => {
    if (!user) return;
    
    setIsLoading(true);
    console.log('NotificationBell: Fetching notifications for user', user.id);
    
    try {
      // Fetch notifications
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }
      
      if (data) {
        console.log('NotificationBell: Fetched notifications:', data.length);
        setNotifications(data);
        
        // Count unread notifications
        const { count, error: countError } = await supabase
          .from('notifications')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('read', false);
        
        if (!countError && count !== null) {
          console.log('NotificationBell: Unread count:', count);
          setUnreadCount(count);
        }
      }
    } catch (err) {
      console.error('Exception in fetchNotifications:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const markAsRead = async (id: string) => {
    console.log('NotificationBell: Marking notification as read:', id);
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);
    
    if (error) {
      console.error('Error marking notification as read:', error);
      return;
    }
    
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
    
    setUnreadCount(prevCount => Math.max(0, prevCount - 1));
  };
  
  const markAllAsRead = async () => {
    if (!user || notifications.length === 0) {
      console.log('NotificationBell: No notifications to mark as read');
      return;
    }
    
    setIsLoading(true);
    console.log('NotificationBell: Marking all notifications as read');
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);
    
    if (error) {
      console.error('Error marking all notifications as read:', error);
      setIsLoading(false);
      return;
    }
    
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => ({ ...notification, read: true }))
    );
    
    setUnreadCount(0);
    setIsLoading(false);
  };

  const handleBellClick = () => {
    // We'll keep the default behavior of toggling the popover
    // But you could add markAllAsRead() here if that's the desired behavior
  };

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
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              disabled={isLoading}
              className="text-xs"
            >
              {isLoading ? "Processing..." : "Mark all as read"}
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {isLoading && notifications.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p>Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p>No notifications</p>
            </div>
          ) : (
            notifications.map(notification => (
              <div 
                key={notification.id}
                className={`p-4 border-b hover:bg-muted/50 cursor-pointer ${getNotificationBgColor(notification.type, notification.read)}`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex justify-between items-start">
                  <p className="font-medium">{notification.title}</p>
                  <span className="text-xs text-muted-foreground">
                    {getNotificationTimeAgo(notification.created_at)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
