
import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  meeting_reminders: boolean;
}

interface NotificationContextType {
  settings: NotificationSettings;
  updateSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  isLoading: boolean;
}

const defaultSettings: NotificationSettings = {
  email_notifications: true,
  push_notifications: true,
  meeting_reminders: true,
};

const NotificationContext = createContext<NotificationContextType>({
  settings: defaultSettings,
  updateSettings: async () => {},
  isLoading: true,
});

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotificationSettings = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        console.log('Fetching notification settings for user:', user.id);
        
        const { data, error } = await supabase
          .from('notification_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching notification settings:', error);
          // Create default settings if error (likely doesn't exist)
          const { error: insertError } = await supabase
            .from('notification_settings')
            .insert({
              user_id: user.id,
              ...defaultSettings,
            });

          if (insertError) {
            console.error('Error creating default notification settings:', insertError);
          } else {
            setSettings(defaultSettings);
          }
        } else if (data) {
          setSettings({
            email_notifications: data.email_notifications ?? true,
            push_notifications: data.push_notifications ?? true,
            meeting_reminders: data.meeting_reminders ?? true,
          });
        } else {
          // Create default settings if none exist
          const { error: insertError } = await supabase
            .from('notification_settings')
            .insert({
              user_id: user.id,
              ...defaultSettings,
            });

          if (insertError) {
            console.error('Error creating default notification settings:', insertError);
          } else {
            setSettings(defaultSettings);
          }
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotificationSettings();
  }, [user]);

  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    if (!user) return;

    try {
      const updatedSettings = { ...settings, ...newSettings };
      
      // First try to update existing record
      const { data: existingSettings } = await supabase
        .from('notification_settings')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      let error = null;

      if (existingSettings) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('notification_settings')
          .update({
            ...updatedSettings,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);
        error = updateError;
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('notification_settings')
          .insert({
            user_id: user.id,
            ...updatedSettings,
          });
        error = insertError;
      }

      if (error) {
        toast({
          title: 'Error updating notification settings',
          description: error.message,
          variant: 'destructive',
        });
        console.error('Error updating notification settings:', error);
        // Revert settings on error
        return;
      } else {
        // Update local state only after successful save
        setSettings(updatedSettings);
        toast({
          title: 'Notification settings updated',
          description: 'Your notification preferences have been saved.',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error updating notification settings',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <NotificationContext.Provider value={{ settings, updateSettings, isLoading }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationSettings = () => useContext(NotificationContext);

export default useNotificationSettings;
