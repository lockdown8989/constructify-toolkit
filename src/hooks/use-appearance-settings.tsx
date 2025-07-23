import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  color_scheme: 'default' | 'blue' | 'green' | 'purple' | 'orange';
  font_size: 'small' | 'medium' | 'large';
  high_contrast: boolean;
  reduced_motion: boolean;
  compact_mode: boolean;
}

interface AppearanceContextType {
  settings: AppearanceSettings;
  updateSettings: (settings: Partial<AppearanceSettings>) => Promise<void>;
  isLoading: boolean;
}

const defaultSettings: AppearanceSettings = {
  theme: 'system',
  color_scheme: 'default',
  font_size: 'medium',
  high_contrast: false,
  reduced_motion: false,
  compact_mode: false,
};

const AppearanceContext = createContext<AppearanceContextType>({
  settings: defaultSettings,
  updateSettings: async () => {},
  isLoading: true,
});

export const AppearanceProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<AppearanceSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAppearanceSettings = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        console.log('Fetching appearance settings for user:', user.id);
        
        const { data, error } = await supabase
          .from('appearance_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching appearance settings:', error);
          // Create default settings if error (likely doesn't exist)
          const { error: insertError } = await supabase
            .from('appearance_settings')
            .insert({
              user_id: user.id,
              ...defaultSettings,
            });

          if (insertError) {
            console.error('Error creating default appearance settings:', insertError);
          } else {
            setSettings(defaultSettings);
          }
        } else if (data) {
          setSettings({
            theme: data.theme as AppearanceSettings['theme'],
            color_scheme: data.color_scheme as AppearanceSettings['color_scheme'],
            font_size: data.font_size as AppearanceSettings['font_size'],
            high_contrast: data.high_contrast ?? false,
            reduced_motion: data.reduced_motion ?? false,
            compact_mode: data.compact_mode ?? false,
          });
        } else {
          // Create default settings if none exist
          const { error: insertError } = await supabase
            .from('appearance_settings')
            .insert({
              user_id: user.id,
              ...defaultSettings,
            });

          if (insertError) {
            console.error('Error creating default appearance settings:', insertError);
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

    fetchAppearanceSettings();
  }, [user]);

  const updateSettings = async (newSettings: Partial<AppearanceSettings>) => {
    if (!user) return;

    try {
      const updatedSettings = { ...settings, ...newSettings };
      
      // First try to find existing record
      const { data: existingSettings } = await supabase
        .from('appearance_settings')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      let error = null;

      if (existingSettings) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('appearance_settings')
          .update({
            ...updatedSettings,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);
        error = updateError;
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('appearance_settings')
          .insert({
            user_id: user.id,
            ...updatedSettings,
          });
        error = insertError;
      }

      if (error) {
        toast({
          title: 'Error updating appearance settings',
          description: error.message,
          variant: 'destructive',
        });
        console.error('Error updating appearance settings:', error);
        return;
      } else {
        // Update local state only after successful save
        setSettings(updatedSettings);
        toast({
          title: 'Appearance settings updated',
          description: 'Your appearance preferences have been saved.',
        });
        
        // Apply theme changes to document
        applyThemeToDocument(updatedSettings);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error updating appearance settings',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Apply theme changes to the document
  const applyThemeToDocument = (settings: AppearanceSettings) => {
    const root = document.documentElement;
    
    // Apply theme
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }

    // Apply color scheme
    if (settings.color_scheme && settings.color_scheme !== 'default') {
      root.setAttribute('data-color-scheme', settings.color_scheme);
    } else {
      root.removeAttribute('data-color-scheme');
    }

    // Apply font size
    root.style.setProperty('--app-font-size', 
      settings.font_size === 'small' ? '14px' : 
      settings.font_size === 'large' ? '18px' : '16px'
    );

    // Apply other settings
    if (settings.high_contrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (settings.reduced_motion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    if (settings.compact_mode) {
      root.classList.add('compact-mode');
    } else {
      root.classList.remove('compact-mode');
    }
  };

  // Apply settings on load and when they change
  useEffect(() => {
    if (!isLoading) {
      applyThemeToDocument(settings);
    }
  }, [settings, isLoading]);

  // Listen for system theme changes
  useEffect(() => {
    if (settings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        applyThemeToDocument(settings);
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [settings.theme, settings]);

  return (
    <AppearanceContext.Provider value={{ settings, updateSettings, isLoading }}>
      {children}
    </AppearanceContext.Provider>
  );
};

export const useAppearanceSettings = () => useContext(AppearanceContext);

export default useAppearanceSettings;