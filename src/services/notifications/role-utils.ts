
import { supabase } from '@/integrations/supabase/client';

export const getManagerUserIds = async (): Promise<string[]> => {
  try {
    const { data: managers, error } = await supabase
      .from('user_roles')
      .select('user_id')
      .in('role', ['employer', 'admin', 'hr', 'manager']);

    if (error) {
      console.error('Error fetching manager user IDs:', error);
      return [];
    }

    return managers?.map(m => m.user_id) || [];
  } catch (error) {
    console.error('Error in getManagerUserIds:', error);
    return [];
  }
};

export const notifyManagersOfClockIn = async (employeeName: string, employeeId: string) => {
  try {
    const managerIds = await getManagerUserIds();
    
    if (managerIds.length === 0) {
      console.log('No managers found to notify about clock-in');
      return { success: true, message: 'No managers to notify' };
    }

    // Import the notification sender
    const { sendBulkNotifications } = await import('./notification-sender');
    
    // Create notifications for all managers
    const notifications = managerIds.map(managerId => ({
      user_id: managerId,
      title: '🔔 Employee Clocked In',
      message: `${employeeName} has clocked in and started their shift.`,
      type: 'info' as const,
      related_entity: 'attendance',
      related_id: employeeId
    }));

    return await sendBulkNotifications(notifications);
  } catch (error) {
    console.error('Error notifying managers of clock-in:', error);
    return { success: false, error };
  }
};
