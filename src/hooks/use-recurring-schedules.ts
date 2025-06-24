
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { addWeeks, format, startOfWeek, addDays } from 'date-fns';

interface CreateRecurringScheduleParams {
  employeeIds: string[];
  shiftPatternId: string;
  patternName: string;
  startTime: string;
  endTime: string;
  weeksToGenerate?: number;
}

export function useCreateRecurringSchedules() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: CreateRecurringScheduleParams) => {
      const { 
        employeeIds, 
        shiftPatternId, 
        patternName,
        startTime, 
        endTime, 
        weeksToGenerate = 12
      } = params;

      console.log('Creating recurring schedules with params:', params);

      const schedules = [];
      const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // Start from Monday

      for (let weekOffset = 0; weekOffset < weeksToGenerate; weekOffset++) {
        const weekStart = addWeeks(currentWeekStart, weekOffset);
        
        // Generate schedules for each day of the week (Monday to Friday)
        for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
          const scheduleDate = addDays(weekStart, dayOffset);
          
          for (const employeeId of employeeIds) {
            const startDateTime = new Date(`${format(scheduleDate, 'yyyy-MM-dd')}T${startTime}`);
            const endDateTime = new Date(`${format(scheduleDate, 'yyyy-MM-dd')}T${endTime}`);
            
            schedules.push({
              employee_id: employeeId,
              title: patternName,
              start_time: startDateTime.toISOString(),
              end_time: endDateTime.toISOString(),
              status: 'pending',
              published: true,
              recurring: true,
              shift_type: 'pattern',
              template_id: shiftPatternId,
              notes: `Auto-generated from shift pattern: ${patternName}`,
              created_platform: 'desktop'
            });
          }
        }
      }

      console.log(`Generated ${schedules.length} schedule entries`);

      // First, delete any existing recurring schedules for this pattern and employees
      if (schedules.length > 0) {
        const { error: deleteError } = await supabase
          .from('schedules')
          .delete()
          .eq('template_id', shiftPatternId)
          .eq('recurring', true)
          .in('employee_id', employeeIds);

        if (deleteError) {
          console.error('Error deleting existing recurring schedules:', deleteError);
        }
      }

      // Insert all schedules in batches
      const batchSize = 100;
      const results = [];
      
      for (let i = 0; i < schedules.length; i += batchSize) {
        const batch = schedules.slice(i, i + batchSize);
        console.log(`Inserting batch ${Math.floor(i/batchSize) + 1} with ${batch.length} schedules`);
        
        const { data, error } = await supabase
          .from('schedules')
          .insert(batch)
          .select();
        
        if (error) {
          console.error('Error creating recurring schedules batch:', error);
          throw error;
        }
        
        results.push(...(data || []));
      }

      console.log(`Successfully created ${results.length} recurring schedules`);
      return results;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      console.log(`Recurring schedules created successfully: ${data.length} schedules for ${variables.employeeIds.length} employees`);
    },
    onError: (error) => {
      console.error('Failed to create recurring schedules:', error);
      toast({
        title: "Error",
        description: "Failed to create recurring schedules. Please try again.",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteRecurringSchedules() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (templateId: string) => {
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('template_id', templateId)
        .eq('recurring', true);

      if (error) {
        console.error('Error deleting recurring schedules:', error);
        throw error;
      }

      return { templateId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast({
        title: "Recurring schedules removed",
        description: "All schedules for this pattern have been removed.",
      });
    },
    onError: (error) => {
      console.error('Failed to delete recurring schedules:', error);
      toast({
        title: "Error",
        description: "Failed to remove recurring schedules. Please try again.",
        variant: "destructive",
      });
    },
  });
}
