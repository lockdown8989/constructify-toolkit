import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth';
import { Notification } from '@/types/supabase';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      console.log('NotificationBell: No user logged in, skipping notification setup');
      return;
    }

    console.log('NotificationBell: Setting up notifications for user', user.id);

    // Load initial notifications
    const fetchNotifications = async () => {
      console.log('NotificationBell: Fetching notifications for user', user.id);
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
        // Explicitly cast data to Notification[] type
        const typedNotifications = data as unknown as Notification[];
        setNotifications(typedNotifications);
        const unreadNotifications = typedNotifications.filter(notification => !notification.read);
        setUnreadCount(unreadNotifications.length);
        console.log('NotificationBell: Unread count:', unreadNotifications.length);
      }
    };
    
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
          const newNotification = payload.new as unknown as Notification;
          setNotifications(prevNotifications => [newNotification, ...prevNotifications]);
          setUnreadCount(prevCount => prevCount + 1);
        }
      )
      .subscribe();
    
    console.log('NotificationBell: Subscribed to notification channel');
    
    return () => {
      console.log('NotificationBell: Cleaning up notification listener');
      supabase.removeChannel(channel);
    };
  }, [user]);
  
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
    
    console.log('NotificationBell: Marking all notifications as read');
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);
    
    if (error) {
      console.error('Error marking all notifications as read:', error);
      return;
    }
    
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => ({ ...notification, read: true }))
    );
    
    setUnreadCount(0);
  };
  
  // For testing, let's log notifications on each render
  console.log('NotificationBell render:', { 
    notificationCount: notifications.length, 
    unreadCount 
  });
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center transform translate-x-1 -translate-y-1">
              {unreadCount}
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
              className="text-xs"
            >
              Mark all as read
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p>No notifications</p>
            </div>
          ) : (
            notifications.map(notification => (
              <div 
                key={notification.id}
                className={`p-4 border-b hover:bg-muted/50 cursor-pointer ${!notification.read ? 'bg-muted/20' : ''}`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex justify-between items-start">
                  <p className="font-medium">{notification.title}</p>
                  <span className="text-xs text-muted-foreground">
                    {new Date(notification.created_at).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit'
                    })}
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
