
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { CalendarPreferences } from '@/types/calendar';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

export function useCalendarPreferences() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  const { data: preferences, isLoading } = useQuery({
    queryKey: ['calendar-preferences'],
    queryFn: async () => {
      if (!user) return null;

      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!employee) return null;

      const { data } = await supabase
        .from('calendar_preferences')
        .select('*')
        .eq('employee_id', employee.id)
        .maybeSingle();

      // Set default mobile view settings if not present
      if (data && !data.mobile_view_settings) {
        data.mobile_view_settings = {
          font_size: 'medium',
          compact_view: true,
          days_visible: 3,
          auto_refresh: true
        };
      }

      return data;
    },
    enabled: !!user
  });

  const updatePreferences = useMutation({
    mutationFn: async (newPreferences: Partial<CalendarPreferences>) => {
      if (!user || !preferences?.id) {
        throw new Error('No preferences found');
      }

      const { data, error } = await supabase
        .from('calendar_preferences')
        .update({
          ...newPreferences,
          updated_at: new Date().toISOString()
        })
        .eq('id', preferences.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-preferences'] });
      toast({
        title: "Preferences updated",
        description: "Your calendar preferences have been saved."
      });
    },
    onError: (error) => {
      console.error('Error updating preferences:', error);
      toast({
        title: "Failed to update preferences",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  });

  return {
    preferences,
    isLoading,
    updatePreferences: updatePreferences.mutate,
    isMobile
  };
}
