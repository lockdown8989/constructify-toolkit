
import { supabase } from '@/integrations/supabase/client';
import type { NotificationData } from '@/models/notification';

/**
 * Sends a notification to a single user
 */
export const sendNotification = async (data: NotificationData) => {
  console.log('NotificationService: Sending notification:', data);
  
  const { error } = await supabase.from('notifications').insert([
    {
      ...data,
      read: false,
      created_at: new Date().toISOString()
    }
  ]);
  
  if (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
  
  console.log('NotificationService: Notification sent successfully');
  return true;
};

/**
 * Sends the same notification to multiple users
 */
export const sendNotificationToMany = async (userIds: string[], notificationData: Omit<NotificationData, 'user_id'>) => {
  console.log('NotificationService: Sending notification to multiple users:', { 
    userCount: userIds.length, 
    notificationData 
  });
  
  const notifications = userIds.map(userId => ({
    ...notificationData,
    user_id: userId,
    read: false,
    created_at: new Date().toISOString()
  }));
  
  const { error } = await supabase.from('notifications').insert(notifications);
  
  if (error) {
    console.error('Error sending multiple notifications:', error);
    throw error;
  }
  
  console.log('NotificationService: Multiple notifications sent successfully');
  return true;
};
