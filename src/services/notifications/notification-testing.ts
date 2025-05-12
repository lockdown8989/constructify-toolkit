
import { supabase } from '@/integrations/supabase/client';
import { sendNotification, sendNotificationsToMany } from './notification-sender';
import { getManagerUserIds } from './role-utils';

/**
 * Test function to send a notification to a specific user
 * @param userId - The user ID to send notification to
 * @returns Object indicating success or failure
 */
export const sendTestNotification = async (userId: string) => {
  try {
    const result = await sendNotification({
      user_id: userId,
      title: 'Test Notification',
      message: 'This is a test notification sent at ' + new Date().toLocaleTimeString(),
      type: 'info'
    });
    
    return result.success;
  } catch (error) {
    console.error('Error sending test notification:', error);
    return false;
  }
};

/**
 * Test function to send a notification to all managers
 * @returns Object indicating success or failure
 */
export const sendTestNotificationToAllManagers = async () => {
  try {
    const managerIds = await getManagerUserIds();
    
    if (managerIds.length === 0) {
      console.warn('No managers found to send notification to');
      return false;
    }
    
    const result = await sendNotificationsToMany(managerIds, {
      title: 'Test Manager Notification',
      message: 'This test notification was sent to all managers at ' + new Date().toLocaleTimeString(),
      type: 'info'
    });
    
    return result.success;
  } catch (error) {
    console.error('Error sending test notification to managers:', error);
    return false;
  }
};
