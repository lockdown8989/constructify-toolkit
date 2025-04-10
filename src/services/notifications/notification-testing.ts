
import { supabase } from '@/integrations/supabase/client';
import type { NotificationResult } from '@/models/notification';
import { sendNotification } from './notification-sender';

/**
 * Verifies if the notifications table is configured correctly
 */
export const verifyNotificationsTable = async (): Promise<NotificationResult> => {
  console.log('NotificationService: Verifying notifications table');
  
  try {
    // Try to fetch a single notification to verify the table structure
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error verifying notifications table:', error);
      return {
        success: false,
        message: `Error: ${error.message}`
      };
    }
    
    console.log('NotificationService: Notifications table verified successfully');
    return {
      success: true,
      message: 'Notifications table verified successfully',
      data
    };
  } catch (error) {
    console.error('Exception verifying notifications table:', error);
    return {
      success: false,
      message: `Exception: ${error}`
    };
  }
};

/**
 * Creates a test notification for a user
 */
export const createTestNotification = async (
  userId: string,
  title: string = 'Test Notification',
  message: string = 'This is a test notification to verify the notification system.',
  type: string = 'info',
  related_entity: string = 'system',
  related_id: string = 'test'
): Promise<NotificationResult> => {
  console.log('NotificationService: Creating test notification for user:', userId);
  
  try {
    await sendNotification({
      user_id: userId,
      title,
      message,
      type,
      related_entity,
      related_id
    });
    
    console.log('NotificationService: Test notification created successfully');
    return {
      success: true,
      message: 'Test notification created successfully'
    };
  } catch (error) {
    console.error('Error creating test notification:', error);
    return {
      success: false,
      message: `Error: ${error}`
    };
  }
};
