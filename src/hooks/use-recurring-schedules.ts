
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { addWeeks, format } from 'date-fns';

interface CreateRecurringSchedulesParams {
  employeeIds: string[];
  shiftPatternId: string;
  patternName: string;
  startTime: string;
  endTime: string;
  weeksToGenerate: number;
}

export const useCreateRecurringSchedules = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: CreateRecurringSchedulesParams) => {
      const { employeeIds, shiftPatternId, patternName, startTime, endTime, weeksToGenerate } = params;
      
      console.log('Creating recurring schedules:', params);

      // Get the shift pattern details
      const { data: shiftPattern, error: patternError } = await supabase
        .from('shift_patterns')
        .select('*')
        .eq('id', shiftPatternId)
        .single();

      if (patternError || !shiftPattern) {
        throw new Error(`Failed to fetch shift pattern: ${patternError?.message}`);
      }

      // Get employee shift assignments to determine which days they work
      const { data: employeeAssignments, error: assignmentError } = await supabase
        .from('employees')
        .select(`
          id,
          monday_shift_id, tuesday_shift_id, wednesday_shift_id, thursday_shift_id,
          friday_shift_id, saturday_shift_id, sunday_shift_id,
          monday_available, tuesday_available, wednesday_available, thursday_available,
          friday_available, saturday_available, sunday_available
        `)
        .in('id', employeeIds);

      if (assignmentError) {
        throw new Error(`Failed to fetch employee assignments: ${assignmentError.message}`);
      }

      const schedulesToCreate = [];
      const today = new Date();

      for (const employee of employeeAssignments || []) {
        const dayAssignments = [
          { day: 1, shiftId: employee.monday_shift_id, available: employee.monday_available },
          { day: 2, shiftId: employee.tuesday_shift_id, available: employee.tuesday_available },
          { day: 3, shiftId: employee.wednesday_shift_id, available: employee.wednesday_available },
          { day: 4, shiftId: employee.thursday_shift_id, available: employee.thursday_available },
          { day: 5, shiftId: employee.friday_shift_id, available: employee.friday_available },
          { day: 6, shiftId: employee.saturday_shift_id, available: employee.saturday_available },
          { day: 0, shiftId: employee.sunday_shift_id, available: employee.sunday_available },
        ];

        for (let week = 0; week < weeksToGenerate; week++) {
          const weekStart = addWeeks(today, week);
          
          for (const dayAssignment of dayAssignments) {
            // Check if employee is assigned to this shift pattern for this day OR if they're generally available
            const isAssignedToPattern = dayAssignment.shiftId === shiftPatternId;
            const isAvailable = dayAssignment.available;
            
            if (isAssignedToPattern || (isAvailable && !dayAssignment.shiftId)) {
              const scheduleDate = new Date(weekStart);
              scheduleDate.setDate(scheduleDate.getDate() + (dayAssignment.day - scheduleDate.getDay() + 7) % 7);
              
              // Create datetime strings for start and end times
              const startDateTime = `${format(scheduleDate, 'yyyy-MM-dd')} ${startTime}`;
              const endDateTime = `${format(scheduleDate, 'yyyy-MM-dd')} ${endTime}`;

              schedulesToCreate.push({
                employee_id: employee.id,
                title: `${patternName} - Rota`,
                start_time: startDateTime,
                end_time: endDateTime,
                status: 'pending',
                shift_type: 'rota',
                published: true,
                published_at: new Date().toISOString(),
                created_platform: 'desktop',
                last_modified_platform: 'desktop',
                mobile_friendly_view: {
                  font_size: 'medium',
                  compact_view: false,
                  high_contrast: false
                },
                mobile_notification_sent: false,
                notes: `Generated from rota pattern: ${patternName}`,
                break_duration: shiftPattern.break_duration,
                is_draft: false,
                can_be_edited: true
              });
            }
          }
        }
      }

      if (schedulesToCreate.length === 0) {
        throw new Error('No schedules to create. Please check employee assignments.');
      }

      // Insert schedules in batches to avoid hitting limits
      const batchSize = 100;
      const results = [];
      
      for (let i = 0; i < schedulesToCreate.length; i += batchSize) {
        const batch = schedulesToCreate.slice(i, i + batchSize);
        
        const { data, error } = await supabase
          .from('schedules')
          .insert(batch)
          .select();

        if (error) {
          console.error('Error inserting schedule batch:', error);
          throw error;
        }

        results.push(...(data || []));
      }

      console.log(`Successfully created ${results.length} recurring schedules`);
      return results;
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['shift_pattern_assignments'] });
      queryClient.invalidateQueries({ queryKey: ['shift-patterns'] });
      
      console.log(`Successfully created ${data.length} recurring schedules for ${variables.employeeIds.length} employees`);
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
};
