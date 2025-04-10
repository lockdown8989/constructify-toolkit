
import { supabase } from '@/integrations/supabase/client';

export interface NotificationData {
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  related_entity: string; // Changed from optional to required
  related_id: string; // Changed from optional to required
}

export const sendNotification = async (data: NotificationData) => {
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
  
  return true;
};

export const sendNotificationToMany = async (userIds: string[], notificationData: Omit<NotificationData, 'user_id'>) => {
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
  
  return true;
};
