
import { supabase } from '@/integrations/supabase/client';
import { NotificationResult } from '@/models/notification';
import { sendNotification } from './notification-sender';

/**
 * Creates a test notification for a user
 */
export const createTestNotification = async (
  userId: string,
  title: string = 'Test Notification',
  message: string = 'This is a test notification from the system.',
  type: 'info' | 'success' | 'warning' | 'error' = 'info',
  related_entity: string = 'test',
  related_id: string = 'test-123'
): Promise<NotificationResult> => {
  try {
    console.log('Creating test notification for user:', userId);
    
    await sendNotification({
      user_id: userId,
      title,
      message,
      type,
      related_entity,
      related_id
    });
    
    return {
      success: true,
      message: 'Test notification created successfully'
    };
  } catch (error: any) {
    console.error('Error creating test notification:', error);
    return {
      success: false,
      message: error.message || 'Failed to create test notification'
    };
  }
};

/**
 * Verifies that the notifications table is configured correctly
 */
export const verifyNotificationsTable = async (): Promise<NotificationResult> => {
  try {
    // Check if we can query the notifications table
    const { data, error, count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .limit(1);
    
    if (error) {
      throw error;
    }
    
    // Check if required columns exist using direct inspection
    const requiredColumns = ['id', 'user_id', 'title', 'message', 'type', 'read', 'created_at', 'related_entity', 'related_id'];
    
    let columnsVerified = true;
    
    // Verify by checking if a sample record has these fields
    if (data && data.length > 0) {
      const record = data[0];
      for (const col of requiredColumns) {
        if (!(col in record)) {
          columnsVerified = false;
          console.error(`Column '${col}' missing from notifications table`);
          break;
        }
      }
    } else {
      // If no records exist, we can only verify the table exists
      columnsVerified = false;
    }
    
    return {
      success: true,
      message: `Notifications table verified successfully. Found ${count} existing notifications.`,
      data: {
        count,
        columnsVerified
      }
    };
  } catch (error: any) {
    console.error('Error verifying notifications table:', error);
    return {
      success: false,
      message: error.message || 'Failed to verify notifications table'
    };
  }
};
