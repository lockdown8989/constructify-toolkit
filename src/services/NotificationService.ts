
import { supabase } from '@/integrations/supabase/client';

export interface NotificationData {
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  related_entity: string; 
  related_id: string; 
}

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

// Function to check if notifications table is configured correctly
export const verifyNotificationsTable = async () => {
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

// Function to create a test notification for the current user
export const createTestNotification = async (userId: string) => {
  console.log('NotificationService: Creating test notification for user:', userId);
  
  try {
    const testData: NotificationData = {
      user_id: userId,
      title: 'Test Notification',
      message: 'This is a test notification to verify the notification system.',
      type: 'info',
      related_entity: 'system',
      related_id: 'test'
    };
    
    await sendNotification(testData);
    
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
