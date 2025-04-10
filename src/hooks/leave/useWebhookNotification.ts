
import { supabase } from "@/integrations/supabase/client";
import { getManagerUserIds } from "@/services/notifications/role-utils";
import { WebhookSetting } from "@/types/supabase";

export const useWebhookNotification = () => {
  // Function to send webhook notifications
  const sendWebhookNotification = async (
    userId: string, 
    title: string, 
    message: string, 
    notificationType: string
  ) => {
    try {
      // Get user's webhook settings using simpler approach
      const { data: settings, error } = await supabase
        .from('webhook_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) throw error;
      
      // If no webhook is configured or the notification type is disabled, skip
      if (!settings || !settings.webhook_url) return;
      
      const typedSettings = settings as WebhookSetting;
      
      // Check if this notification type is enabled
      let isEnabled = false;
      if (notificationType === 'shift_swaps' && typedSettings.notify_shift_swaps) isEnabled = true;
      if (notificationType === 'availability' && typedSettings.notify_availability) isEnabled = true;
      if (notificationType === 'leave' && typedSettings.notify_leave) isEnabled = true;
      if (notificationType === 'attendance' && typedSettings.notify_attendance) isEnabled = true;
      
      if (!isEnabled) return;
      
      // Send webhook notification
      await supabase.functions.invoke('send-webhook', {
        body: {
          webhookType: typedSettings.webhook_type,
          webhookUrl: typedSettings.webhook_url,
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
