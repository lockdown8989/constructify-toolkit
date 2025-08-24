
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ViewType } from '@/components/schedule/types/calendar-types';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

export interface CalendarPreferences {
  id?: string;
  employee_id: string;
  default_view: ViewType;
  show_weekends: boolean;
  color_scheme: string;
  visible_hours: {
    start: number;
    end: number;
  };
  mobile_view_settings: {
    font_size: 'small' | 'medium' | 'large';
    compact_view: boolean;
    days_visible: number;
    auto_refresh: boolean;
  };
}

export const useCalendarPreferences = () => {
  const [preferences, setPreferences] = useState<CalendarPreferences | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const saveInProgress = useRef(false);
  const toastDebounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Fetch calendar preferences
  useEffect(() => {
    const fetchPreferences = async () => {
      if (!user) return;

      setIsLoading(true);

      try {
        // First get employee ID for the current user
        const { data: employeeData, error: employeeError } = await supabase
          .from('employees')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (employeeError || !employeeData) {
          console.error('Error fetching employee data:', employeeError);
          setIsLoading(false);
          return;
        }

        // Fetch calendar preferences for this employee
        const { data, error } = await supabase
          .from('calendar_preferences')
          .select('*')
          .eq('employee_id', employeeData.id)
          .single();

        if (error && error.code !== 'PGRST116') { // Not found error
          console.error('Error fetching calendar preferences:', error);
        }

        if (data) {
          setPreferences(data as CalendarPreferences);
        } else {
          // Create default preferences if none exist
          const defaultPreferences: Omit<CalendarPreferences, 'id'> = {
            employee_id: employeeData.id,
            default_view: 'week',
            show_weekends: true,
            color_scheme: 'default',
            visible_hours: {
              start: 8,
              end: 20
            },
            mobile_view_settings: {
              font_size: 'medium',
              compact_view: true,
              days_visible: 3,
              auto_refresh: true
            }
          };

          const { data: newData, error: insertError } = await supabase
            .from('calendar_preferences')
            .insert(defaultPreferences)
            .select()
            .single();

          if (insertError) {
            console.error('Error creating default preferences:', insertError);
          } else {
            setPreferences(newData as CalendarPreferences);
          }
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreferences();
  }, [user]);

  // Update calendar preferences with debounce to prevent duplicate toasts
  const updatePreferences = async (updatedPrefs: Partial<CalendarPreferences>) => {
    if (!preferences?.id || saveInProgress.current) return;
    
    saveInProgress.current = true;
    
    try {
      // Clear any existing toast timeout
      if (toastDebounceTimeout.current) {
        clearTimeout(toastDebounceTimeout.current);
        toastDebounceTimeout.current = null;
      }
      
      const { error } = await supabase
        .from('calendar_preferences')
        .update({ ...updatedPrefs, updated_at: new Date() })
        .eq('id', preferences.id);

      if (error) {
        console.error('Error updating preferences:', error);
        toast({
          title: 'Error',
          description: 'Failed to update calendar preferences',
          variant: 'destructive'
        });
        return;
      }

      setPreferences(prev => prev ? { ...prev, ...updatedPrefs } : null);
      
      // Debounce toast notification with a 1 second delay
      toastDebounceTimeout.current = setTimeout(() => {
        toast({
          title: 'Preferences updated',
          description: 'Your calendar preferences have been saved',
        });
      }, 1000);
    } catch (error) {
      console.error('Unexpected error updating preferences:', error);
    } finally {
      saveInProgress.current = false;
    }
  };

  // Update just the default view with debouncing
  const setDefaultView = async (view: ViewType) => {
    // Don't update if it's the same view to prevent unnecessary API calls
    if (preferences?.default_view === view) return;
    await updatePreferences({ default_view: view });
  };

  return {
    preferences,
    isLoading,
    updatePreferences,
    setDefaultView
  };
};
