import { supabase } from '@/integrations/supabase/client';
import type { NotificationData } from '@/models/notification';

/**
 * Sends a notification to a single user
 */
export const sendNotification = async (data: NotificationData) => {
  console.log('NotificationService: Sending notification:', data);
  
  if (!data.user_id) {
    console.error('Error: Cannot send notification without a user_id');
    return false;
  }
  
  try {
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
    
    console.log('NotificationService: Notification sent successfully to user', data.user_id);
    return true;
  } catch (error) {
    console.error('Exception in sendNotification:', error);
    return false;
  }
};

/**
 * Sends the same notification to multiple users
 */
export const sendNotificationToMany = async (userIds: string[], notificationData: Omit<NotificationData, 'user_id'>) => {
  console.log('NotificationService: Sending notification to multiple users:', { 
    userCount: userIds.length, 
    userIds: userIds,
    notificationData 
  });
  
  if (!userIds || userIds.length === 0) {
    console.warn('NotificationService: No valid user IDs provided, skipping notification');
    return false;
  }
  
  // Filter out any undefined or null values
  const validUserIds = userIds.filter(id => !!id);
  
  if (validUserIds.length === 0) {
    console.warn('NotificationService: All provided user IDs were invalid, skipping notification');
    return false;
  }
  
  const notifications = validUserIds.map(userId => ({
    ...notificationData,
    user_id: userId,
    read: false,
    created_at: new Date().toISOString()
  }));
  
  try {
    const { error } = await supabase.from('notifications').insert(notifications);
    
    if (error) {
      console.error('Error sending multiple notifications:', error);
      throw error;
    }
    
    console.log(`NotificationService: Successfully sent notifications to ${validUserIds.length} users`);
    return true;
  } catch (error) {
    console.error('Exception in sendNotificationToMany:', error);
    return false;
  }
};

/**
 * Sends a notification for a schedule assignment
 */
export const sendScheduleAssignmentNotification = async (
  userId: string,
  shiftTitle: string,
  startTime: string,
  endTime: string,
  scheduleId: string
) => {
  return sendNotification({
    user_id: userId,
    title: 'New Shift Assignment',
    message: `You have been assigned to ${shiftTitle} from ${new Date(startTime).toLocaleString()} to ${new Date(endTime).toLocaleString()}`,
    type: 'info',
    related_entity: 'schedules',
    related_id: scheduleId
  });
};
