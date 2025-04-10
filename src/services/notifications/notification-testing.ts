
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
    
    // Check if required columns exist
    const checkColumns = async () => {
      // Using system tables to check columns (needs appropriate permissions)
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', 'notifications')
        .eq('table_schema', 'public');
      
      if (columnsError) {
        return false;
      }
      
      const columnNames = columns.map(c => c.column_name);
      const requiredColumns = ['id', 'user_id', 'title', 'message', 'type', 'read', 'created_at', 'related_entity', 'related_id'];
      
      return requiredColumns.every(col => columnNames.includes(col));
    };
    
    const columnsExist = await checkColumns();
    
    return {
      success: true,
      message: `Notifications table verified successfully. Found ${count} existing notifications.`,
      data: {
        count,
        columnsVerified: columnsExist
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
