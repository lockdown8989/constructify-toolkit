
// Re-export notification services
export { sendNotification } from './notification-sender';
export { getManagerUserIds, getEmployeeUserIds } from './role-utils';
export * from './payroll-notifications';
export * from './document-notifications';

// Create the testing functions that were being imported but don't exist
export const sendTestNotification = async (userId: string) => {
  try {
    const { sendNotification } = await import('./notification-sender');
    const result = await sendNotification({
      user_id: userId,
      title: 'Test Notification',
      message: 'This is a test notification to verify the notification system is working.',
      type: 'info',
      related_entity: 'test',
      related_id: 'test-id'
    });
    
    return { success: true, result };
  } catch (error) {
    console.error('Error sending test notification:', error);
    return { success: false, error: String(error) };
  }
};

export const verifyNotificationsTable = async () => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true });
      
    if (error) throw error;
    
    return { 
      success: true, 
      tableExists: true,
      recordCount: count 
    };
  } catch (error) {
    console.error('Error verifying notifications table:', error);
    return { 
      success: false, 
      tableExists: false,
      error: String(error)
    };
  }
};
