
export * from './notification-sender';
export * from './document-notifications';
export * from './leave-notifications';
export * from './payroll-notifications';
export * from './notification-testing';

// Additional exports for testing functionality
export const sendTestNotification = async (userId: string) => {
  const { sendNotification } = await import('./notification-sender');
  return await sendNotification({
    user_id: userId,
    title: '🧪 Test Notification',
    message: 'This is a test notification to verify the system is working correctly.',
    type: 'info',
    related_entity: 'system',
    related_id: 'test'
  });
};

export const verifyNotificationsTable = async () => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data, error } = await supabase.from('notifications').select('id').limit(1);
    
    if (error) {
      return { success: false, message: `Database error: ${error.message}` };
    }
    
    return { success: true, message: 'Notifications table verified successfully' };
  } catch (error) {
    return { success: false, message: `Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
};
