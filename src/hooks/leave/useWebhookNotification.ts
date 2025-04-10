
import { supabase } from "@/integrations/supabase/client";
import { getManagerUserIds } from "@/services/notifications/role-utils";

export const useWebhookNotification = () => {
  // Function to send webhook notifications
  const sendWebhookNotification = async (
    userId: string, 
    title: string, 
    message: string, 
    notificationType: string
  ) => {
    try {
      // Get user's webhook settings
      const { data, error } = await supabase
        .from('webhook_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) throw error;
      
      // If no webhook is configured or the notification type is disabled, skip
      if (!data || !data.webhook_url) return;
      
      // Check if this notification type is enabled
      let isEnabled = false;
      if (notificationType === 'shift_swaps' && data.notify_shift_swaps) isEnabled = true;
      if (notificationType === 'availability' && data.notify_availability) isEnabled = true;
      if (notificationType === 'leave' && data.notify_leave) isEnabled = true;
      if (notificationType === 'attendance' && data.notify_attendance) isEnabled = true;
      
      if (!isEnabled) return;
      
      // Send webhook notification
      await supabase.functions.invoke('send-webhook', {
        body: {
          webhookType: data.webhook_type,
          webhookUrl: data.webhook_url,
          title,
          message,
          data: {
            type: notificationType,
            timestamp: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      console.error('Error sending webhook notification:', error);
    }
  };

  return {
    sendWebhookNotification,
    getManagerUserIds
  };
};
