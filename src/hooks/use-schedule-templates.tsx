
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ScheduleTemplate } from '@/types/calendar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

export function useScheduleTemplates() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['schedule-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schedule_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const createTemplate = useMutation({
    mutationFn: async (template: Omit<ScheduleTemplate, 'id'>) => {
      const { data, error } = await supabase
        .from('schedule_templates')
        .insert([{ ...template, created_by: user?.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-templates'] });
      toast({
        title: "Template created",
        description: "The schedule template has been saved."
      });
    },
    onError: (error) => {
      console.error('Error creating template:', error);
      toast({
        title: "Failed to create template",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  });

  return {
    templates,
    isLoading,
    createTemplate: createTemplate.mutate
  };
}
