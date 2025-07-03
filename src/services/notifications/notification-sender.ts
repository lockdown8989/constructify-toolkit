
import { supabase } from '@/integrations/supabase/client';
import { NotificationData } from '@/models/notification';

export const sendNotification = async (notificationData: NotificationData) => {
  try {
    console.log('Sending notification:', notificationData);
    
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: notificationData.user_id,
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type,
        related_entity: notificationData.related_entity,
        related_id: notificationData.related_id,
        read: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error sending notification:', error);
      throw error;
    }

    console.log('Notification sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send notification:', error);
    return { success: false, error };
  }
};

export const sendBulkNotifications = async (notifications: NotificationData[]) => {
  try {
    const notificationInserts = notifications.map(notification => ({
      user_id: notification.user_id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      related_entity: notification.related_entity,
      related_id: notification.related_id,
      read: false
    }));

    const { data, error } = await supabase
      .from('notifications')
      .insert(notificationInserts)
      .select();

    if (error) {
      console.error('Error sending bulk notifications:', error);
      throw error;
    }

    console.log('Bulk notifications sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send bulk notifications:', error);
    return { success: false, error };
  }
};

export const notifyManagersOfNewEmployee = async (employeeName: string, jobTitle: string, department: string, employeeId: string) => {
  try {
    // Get all managers (users with employer, admin, or hr roles)
    const { data: managers, error: managersError } = await supabase
      .from('user_roles')
      .select('user_id')
      .in('role', ['employer', 'admin', 'hr']);

    if (managersError) {
      console.error('Error fetching managers:', managersError);
      return { success: false, error: managersError };
    }

    if (!managers || managers.length === 0) {
      console.log('No managers found to notify');
      return { success: true, message: 'No managers to notify' };
    }

    // Create notifications for all managers
    const notifications: NotificationData[] = managers.map(manager => ({
      user_id: manager.user_id,
      title: '👥 New Employee Added',
      message: `${employeeName} has joined the team as ${jobTitle} in the ${department} department.`,
      type: 'info' as const,
      related_entity: 'employees',
      related_id: employeeId
    }));

    return await sendBulkNotifications(notifications);
  } catch (error) {
    console.error('Error notifying managers of new employee:', error);
    return { success: false, error };
  }
};
