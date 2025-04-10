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

// Function to create a leave request notification
export const createLeaveRequestNotification = async (userId: string, leaveId: string, start: string, end: string, type: string) => {
  console.log('NotificationService: Creating leave request notification for user:', userId);
  
  try {
    const notificationData: NotificationData = {
      user_id: userId,
      title: 'Leave Request Submitted',
      message: `Your ${type} request for ${start} to ${end} has been submitted successfully and is pending approval.`,
      type: 'success',
      related_entity: 'leave_request',
      related_id: leaveId
    };
    
    await sendNotification(notificationData);
    
    console.log('NotificationService: Leave request notification created successfully');
    return {
      success: true,
      message: 'Leave request notification created successfully'
    };
  } catch (error) {
    console.error('Error creating leave request notification:', error);
    return {
      success: false,
      message: `Error: ${error}`
    };
  }
};

// Get all manager user IDs from user_roles table
export const getManagerUserIds = async (): Promise<string[]> => {
  console.log('NotificationService: Getting manager user IDs');
  
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'employer');
      
    if (error) {
      console.error('Error getting manager user IDs:', error);
      throw error;
    }
    
    // Also get admin and HR user IDs
    const { data: adminData, error: adminError } = await supabase
      .from('user_roles')
      .select('user_id')
      .in('role', ['admin', 'hr']);
      
    if (adminError) {
      console.error('Error getting admin/HR user IDs:', adminError);
      throw adminError;
    }
    
    // Combine all manager user IDs
    const managerIds = [...(data || []), ...(adminData || [])].map(item => item.user_id);
    console.log('NotificationService: Found manager user IDs:', managerIds);
    
    return managerIds;
  } catch (error) {
    console.error('Exception getting manager user IDs:', error);
    return [];
  }
};

// Function to notify managers about a new leave request
export const notifyManagersAboutLeaveRequest = async (leaveId: string, employeeName: string, start: string, end: string, type: string) => {
  console.log('NotificationService: Notifying managers about new leave request');
  
  try {
    // Get all manager user IDs
    const managerIds = await getManagerUserIds();
    
    if (managerIds.length === 0) {
      console.log('NotificationService: No managers found to notify');
      return false;
    }
    
    // Create notification data for managers
    const notificationData: Omit<NotificationData, 'user_id'> = {
      title: 'New Leave Request',
      message: `${employeeName} has requested ${type} leave from ${start} to ${end}.`,
      type: 'info',
      related_entity: 'leave_request',
      related_id: leaveId
    };
    
    // Send notifications to all managers
    await sendNotificationToMany(managerIds, notificationData);
    
    console.log('NotificationService: Managers notified successfully');
    return true;
  } catch (error) {
    console.error('Error notifying managers:', error);
    return false;
  }
};
