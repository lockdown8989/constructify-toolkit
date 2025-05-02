
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { OpenShiftType } from '@/types/supabase/schedules';
import { useShiftCancellation } from './use-shift-cancellation';
import { isAfter, parseISO } from 'date-fns';

export function useOpenShifts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { cancelShift } = useShiftCancellation();

  const { data: openShifts = [], isLoading } = useQuery({
    queryKey: ['open-shifts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('open_shifts')
        .select('*')
        // Only fetch non-expired shifts or shifts without expiration date
        .or(`expiration_date.gt.${new Date().toISOString()},expiration_date.is.null`)
        .order('position_order', { ascending: true, nullsFirst: false })
        .order('start_time', { ascending: true });

      if (error) throw error;
      
      // Process data to ensure compatibility with both formats
      return data.map((shift: any) => ({
        ...shift,
        // Add virtual property aliases for compatibility
        startTime: new Date(shift.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        endTime: new Date(shift.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        day: shift.day || new Date(shift.start_time).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
      })) as OpenShiftType[];
    },
    enabled: !!user
  });

  const assignShift = useMutation({
    mutationFn: async ({ openShiftId, employeeId }: { openShiftId: string, employeeId: string }) => {
      // Get the open shift details first to check expiration
      const { data: openShift, error: shiftError } = await supabase
        .from('open_shifts')
        .select('*')
        .eq('id', openShiftId)
        .single();

      if (shiftError) throw shiftError;
      
      // Check if the shift has expired
      if (openShift.expiration_date && isAfter(new Date(), parseISO(openShift.expiration_date))) {
        throw new Error("This shift has expired and is no longer available.");
      }

      // First, create the assignment record
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('open_shift_assignments')
        .insert({
          open_shift_id: openShiftId,
          employee_id: employeeId,
          assigned_by: user?.id,
          status: 'confirmed'
        })
        .select()
        .single();

      if (assignmentError) throw assignmentError;

      // Create a schedule entry for the assigned shift
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('schedules')
        .insert({
          employee_id: employeeId,
          title: openShift.title,
          start_time: openShift.start_time,
          end_time: openShift.end_time
        })
        .select()
        .single();

      if (scheduleError) throw scheduleError;

      // Get employee data for notification
      const { data: employee, error: employeeError } = await supabase
        .from('employees')
        .select('user_id, name')
        .eq('id', employeeId)
        .single();

      if (employeeError) throw employeeError;

      // Create notification for the employee
      if (employee.user_id) {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: employee.user_id,
            title: 'New Shift Assignment',
            message: `You have been assigned to ${openShift.title} from ${new Date(openShift.start_time).toLocaleString()} to ${new Date(openShift.end_time).toLocaleString()}`,
            type: 'info',
            related_entity: 'schedules',
            related_id: scheduleData.id
          });

        if (notificationError) {
          console.error('Error creating notification:', notificationError);
        }
      }

      return { assignmentData, scheduleData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['open-shifts'] });
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast.success('Shift assigned successfully');
    },
    onError: (error) => {
      console.error('Error assigning shift:', error);
      toast.error('Failed to assign shift: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  });

  return {
    openShifts,
    isLoading,
    assignShift,
    cancelShift
  };
}
