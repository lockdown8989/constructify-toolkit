
import { supabase } from '@/integrations/supabase/client';
import { sendNotification } from './notification-sender';

export const testNotificationSystem = async () => {
  try {
    console.log('Testing notification system...');
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No authenticated user found');
      return false;
    }

    // Send a test notification
    const result = await sendNotification({
      user_id: user.id,
      title: '🧪 Test Notification',
      message: 'This is a test notification to verify the system is working correctly.',
      type: 'info',
      related_entity: 'system',
      related_id: 'test'
    });

    if (result.success) {
      console.log('Test notification sent successfully');
      return true;
    } else {
      console.error('Test notification failed:', result.error);
      return false;
    }
  } catch (error) {
    console.error('Error testing notification system:', error);
    return false;
  }
};

export const sendTestNotificationToManagers = async () => {
  try {
    // Get all managers
    const { data: managers, error } = await supabase
      .from('user_roles')
      .select('user_id')
      .in('role', ['employer', 'admin', 'hr']);

    if (error) {
      console.error('Error fetching managers:', error);
      return false;
    }

    if (!managers || managers.length === 0) {
      console.log('No managers found');
      return false;
    }

    // Send test notifications to all managers
    const results = await Promise.all(
      managers.map(manager => 
        sendNotification({
          user_id: manager.user_id,
          title: '🧪 Manager Test Notification',
          message: 'This is a test notification for managers to verify the notification system.',
          type: 'info',
          related_entity: 'system',
          related_id: 'manager-test'
        })
      )
    );

    const successCount = results.filter(result => result.success).length;
    console.log(`Sent ${successCount} test notifications to managers`);
    
    return successCount > 0;
  } catch (error) {
    console.error('Error sending test notifications to managers:', error);
    return false;
  }
};
