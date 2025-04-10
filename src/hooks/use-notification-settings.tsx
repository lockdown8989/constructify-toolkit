
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
          toast({
            title: 'Error fetching notification settings',
            description: error.message,
            variant: 'destructive',
          });
        } else if (data) {
          console.log('Notification settings found:', data);
          setSettings({
            email_notifications: data.email_notifications ?? true,
            push_notifications: data.push_notifications ?? true,
            meeting_reminders: data.meeting_reminders ?? true,
          });
        } else {
          console.log('No notification settings found, creating defaults');
          // Create default settings if none exist
          const { error: insertError } = await supabase
            .from('notification_settings')
            .insert({
              user_id: user.id,
              ...defaultSettings,
            });

          if (insertError) {
            console.error('Error creating default notification settings:', insertError);
            toast({
              title: 'Error creating notification settings',
              description: insertError.message,
              variant: 'destructive',
            });
          }
        }
      } catch (error: any) {
        console.error('Exception in fetchNotificationSettings:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to load notification settings',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotificationSettings();
  }, [user, toast]);

  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    if (!user) return;

    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);

      console.log('Updating notification settings:', updatedSettings);
      
      // Check if settings exist for this user before updating
      const { data: existingSettings, error: checkError } = await supabase
        .from('notification_settings')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (checkError) {
        throw checkError;
      }

      let error;
      
      if (existingSettings) {
        // Update existing settings
        const { error: updateError } = await supabase
          .from('notification_settings')
          .update({
            ...updatedSettings,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);
          
        error = updateError;
      } else {
        // Insert new settings
        const { error: insertError } = await supabase
          .from('notification_settings')
          .insert({
            user_id: user.id,
            ...updatedSettings,
            updated_at: new Date().toISOString(),
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
      } else {
        toast({
          title: 'Notification settings updated',
          description: 'Your notification preferences have been saved.',
        });
      }
    } catch (error: any) {
      console.error('Exception in updateSettings:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update notification settings',
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
