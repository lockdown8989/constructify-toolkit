
import { supabase } from "@/integrations/supabase/client";
import { getManagerUserIds } from "@/services/notifications/role-utils";
import { WebhookSetting } from "@/types/supabase";

// Use local storage keys for webhook settings
const WEBHOOK_SETTINGS_KEY = 'webhook_settings';

export const useWebhookNotification = () => {
  // Function to send webhook notifications
  const sendWebhookNotification = async (
    userId: string, 
    title: string, 
    message: string, 
    notificationType: string
  ) => {
    try {
      // Get user's webhook settings from local storage
      const settingsStr = localStorage.getItem(`${WEBHOOK_SETTINGS_KEY}_${userId}`);
      if (!settingsStr) return;
      
      const settings: WebhookSetting = JSON.parse(settingsStr);
      
      // If no webhook is configured, skip
      if (!settings || !settings.webhook_url) return;
      
      // Check if this notification type is enabled
      let isEnabled = false;
      if (notificationType === 'shift_swaps' && settings.notify_shift_swaps) isEnabled = true;
      if (notificationType === 'availability' && settings.notify_availability) isEnabled = true;
      if (notificationType === 'leave' && settings.notify_leave) isEnabled = true;
      if (notificationType === 'attendance' && settings.notify_attendance) isEnabled = true;
      
      if (!isEnabled) return;
      
      // Send webhook notification
      await supabase.functions.invoke('send-webhook', {
        body: {
          webhookType: settings.webhook_type,
          webhookUrl: settings.webhook_url,
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

  // Function to save webhook settings
  // Updated to not require user_id in the settings parameter
  const saveWebhookSettings = async (userId: string, settings: {
    webhook_url: string;
    webhook_type: string;
    notify_shift_swaps: boolean;
    notify_availability: boolean;
    notify_leave: boolean;
    notify_attendance: boolean;
  }) => {
    try {
      const webhookSettings: WebhookSetting = {
        id: crypto.randomUUID(),
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...settings
      };
      
      localStorage.setItem(`${WEBHOOK_SETTINGS_KEY}_${userId}`, JSON.stringify(webhookSettings));
      return { success: true };
    } catch (error) {
      console.error('Error saving webhook settings:', error);
      return { success: false, error };
    }
  };
  
  // Function to get webhook settings
  const getWebhookSettings = async (userId: string): Promise<WebhookSetting | null> => {
    try {
      const settingsStr = localStorage.getItem(`${WEBHOOK_SETTINGS_KEY}_${userId}`);
      if (!settingsStr) return null;
      
      return JSON.parse(settingsStr) as WebhookSetting;
    } catch (error) {
      console.error('Error getting webhook settings:', error);
      return null;
    }
  };

  return {
    sendWebhookNotification,
    saveWebhookSettings,
    getWebhookSettings,
    getManagerUserIds
  };
};
