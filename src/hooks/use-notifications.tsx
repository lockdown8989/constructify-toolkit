
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
  related_entity?: string;
  related_id?: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      console.log('useNotifications: No user logged in, skipping notification setup');
      return;
    }

    console.log('useNotifications: Setting up notifications for user', user.id);

    // Load initial notifications
    fetchNotifications();
    
    // Set up real-time listener for new notifications
    console.log('useNotifications: Setting up real-time listener for notifications');
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
          console.log('useNotifications: New notification received:', payload);
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
    
    console.log('useNotifications: Subscribed to notification channel');
    
    return () => {
      console.log('useNotifications: Cleaning up notification listener');
      supabase.removeChannel(channel);
    };
  }, [user, toast]);
  
  const fetchNotifications = async () => {
    if (!user) return;
    
    setIsLoading(true);
    console.log('useNotifications: Fetching notifications for user', user.id);
    
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
        console.log('useNotifications: Fetched notifications:', data.length);
        setNotifications(data);
        
        // Count unread notifications
        const { count, error: countError } = await supabase
          .from('notifications')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('read', false);
        
        if (!countError && count !== null) {
          console.log('useNotifications: Unread count:', count);
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
    console.log('useNotifications: Marking notification as read:', id);
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
      console.log('useNotifications: No notifications to mark as read');
      return;
    }
    
    setIsLoading(true);
    console.log('useNotifications: Marking all notifications as read');
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

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead
  };
};
