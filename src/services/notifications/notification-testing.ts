
import { supabase } from '@/integrations/supabase/client';
import { sendNotification } from './notification-sender';

/**
 * Sends a test notification to the current user
 */
export const sendTestNotification = async (userId: string) => {
  try {
    return sendNotification({
      user_id: userId,
      title: 'Test Notification',
      message: 'This is a test notification. If you can see this, notifications are working correctly!',
      type: 'info',
      related_entity: 'test',
      related_id: 'test-notification'
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    return false;
  }
};

/**
 * Cleans up all test notifications for a user
 */
export const cleanupTestNotifications = async (userId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId)
      .eq('related_entity', 'test');
    
    if (error) {
      console.error('Error cleaning up test notifications:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception in cleanupTestNotifications:', error);
    return false;
  }
};
