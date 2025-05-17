
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { ViewType } from '@/components/schedule/types/calendar-types';
import { useToast } from './use-toast';

// Hook to manage calendar preferences for the user
export const useCalendarPreferences = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<ViewType>('week');
  const [showWeekends, setShowWeekends] = useState(true);
  const [employeeId, setEmployeeId] = useState<string | null>(null);

  // Fetch employee ID
  useEffect(() => {
    if (user) {
      const getEmployeeId = async () => {
        try {
          const { data, error } = await supabase
            .from('employees')
            .select('id')
            .eq('user_id', user.id)
            .single();
            
          if (error) {
            console.error('Error fetching employee ID:', error);
            return;
          }
          
          if (data) {
            setEmployeeId(data.id);
          }
        } catch (err) {
          console.error('Error in getEmployeeId:', err);
        }
      };
      
      getEmployeeId();
    }
  }, [user]);

  // Fetch calendar preferences
  useEffect(() => {
    if (employeeId) {
      const fetchPreferences = async () => {
        try {
          setLoading(true);
          
          const { data, error } = await supabase
            .from('calendar_preferences')
            .select('*')
            .eq('employee_id', employeeId)
            .single();
            
          if (error && error.code !== 'PGRST116') {
            // PGRST116 is "not found" which is expected for new users
            console.error('Error fetching calendar preferences:', error);
          }
          
          if (data) {
            // Apply preferences
            setViewType(data.default_view as ViewType);
            setShowWeekends(data.show_weekends);
          } else {
            // Create default preferences if none exist
            await createDefaultPreferences(employeeId);
          }
        } catch (err) {
          console.error('Error in fetchPreferences:', err);
        } finally {
          setLoading(false);
        }
      };
      
      fetchPreferences();
    }
  }, [employeeId]);

  // Create default preferences for new users
  const createDefaultPreferences = async (employeeId: string) => {
    try {
      const { error } = await supabase
        .from('calendar_preferences')
        .insert({
          employee_id: employeeId,
          default_view: 'week',
          show_weekends: true,
          color_scheme: 'default',
          visible_hours: { start: 8, end: 20 },
          mobile_view_settings: {
            font_size: 'medium',
            compact_view: true,
            days_visible: 3,
            auto_refresh: true
          }
        });
        
      if (error) {
        console.error('Error creating default preferences:', error);
      }
    } catch (err) {
      console.error('Error in createDefaultPreferences:', err);
    }
  };

  // Save preferences when view type changes
  const updateViewType = async (newViewType: ViewType) => {
    setViewType(newViewType);
    
    if (employeeId) {
      try {
        const { error } = await supabase
          .from('calendar_preferences')
          .update({ default_view: newViewType })
          .eq('employee_id', employeeId);
          
        if (error) {
          console.error('Error updating view type:', error);
          toast({
            title: "Preferences Not Saved",
            description: "There was an error saving your calendar preferences.",
            variant: "destructive"
          });
        }
      } catch (err) {
        console.error('Error in updateViewType:', err);
      }
    }
  };

  // Toggle weekend visibility
  const toggleWeekends = async () => {
    const newValue = !showWeekends;
    setShowWeekends(newValue);
    
    if (employeeId) {
      try {
        const { error } = await supabase
          .from('calendar_preferences')
          .update({ show_weekends: newValue })
          .eq('employee_id', employeeId);
          
        if (error) {
          console.error('Error updating weekend visibility:', error);
        }
      } catch (err) {
        console.error('Error in toggleWeekends:', err);
      }
    }
  };

  return {
    loading,
    viewType,
    showWeekends,
    updateViewType,
    toggleWeekends
  };
};
