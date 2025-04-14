
import { supabase } from '@/integrations/supabase/client';
import { sendNotification } from './notification-sender';
import type { NotificationResult } from '@/models/notification';

/**
 * Creates a test notification for the current user
 */
export const sendTestNotification = async (userId: string): Promise<NotificationResult> => {
  try {
    console.log('NotificationTest: Sending test notification to user:', userId);
    
    if (!userId) {
      console.error('NotificationTest: Cannot send test notification - no user ID provided');
      return {
        success: false,
        message: 'No user ID provided'
      };
    }
    
    const success = await sendNotification({
      user_id: userId,
      title: 'Test Notification',
      message: 'This is a test notification. If you can see this, notifications are working correctly!',
      type: 'info',
      related_entity: 'test',
      related_id: 'test-notification'
    });
    
    return {
      success,
      message: success ? 'Test notification sent successfully' : 'Failed to send test notification'
    };
  } catch (error) {
    console.error('Exception in sendTestNotification:', error);
    return {
      success: false,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

/**
 * Verifies that the notifications table exists and is accessible
 */
export const verifyNotificationsTable = async (): Promise<NotificationResult> => {
  try {
    console.log('NotificationTest: Verifying notifications table');
    
    // Try to query the notifications table
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('NotificationTest: Error verifying notifications table:', error);
      return {
        success: false,
        message: `Database error: ${error.message}`
      };
    }
    
    return {
      success: true,
      message: `Notifications table verified successfully. Table has ${count} notifications.`,
      data: { count }
    };
  } catch (error) {
    console.error('Exception in verifyNotificationsTable:', error);
    return {
      success: false,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};
