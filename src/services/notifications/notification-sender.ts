
import { supabase } from '@/integrations/supabase/client';

interface NotificationPayload {
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  related_entity?: string;
  related_id?: string;
}

export const sendNotification = async (payload: NotificationPayload) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: payload.user_id,
        title: payload.title,
        message: payload.message,
        type: payload.type,
        related_entity: payload.related_entity,
        related_id: payload.related_id
      });
      
    if (error) throw error;
    
    console.log(`Notification sent to user ${payload.user_id}: ${payload.title}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending notification:', error);
    return { success: false, error: String(error) };
  }
};

// Utility function to get all manager user IDs
export const getManagerUserIds = async () => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('user_id')
      .in('role', ['employer', 'admin', 'hr']);
      
    if (error) throw error;
    
    return data.map(role => role.user_id);
  } catch (error) {
    console.error('Error fetching manager user IDs:', error);
    return [];
  }
};
