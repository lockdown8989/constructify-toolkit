
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { sendNotification } from '@/services/notifications/notification-sender';

export const useShiftAssignment = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const assignShift = useMutation({
    mutationFn: async ({ openShiftId, employeeId }: { openShiftId: string, employeeId: string }) => {
      try {
        // Detailed error handling with specific error messages
        if (!user) {
          throw new Error('User not authenticated');
        }

        // Fetch open shift details
        const { data: openShift, error: shiftError } = await supabase
          .from('open_shifts')
          .select('*')
          .eq('id', openShiftId)
          .single();

        if (shiftError) {
          throw new Error(`Failed to fetch open shift details: ${shiftError.message}`);
        }

        // Create open shift assignment
        const { data: assignmentData, error: assignmentError } = await supabase
          .from('open_shift_assignments')
          .insert({
            open_shift_id: openShiftId,
            employee_id: employeeId,
            assigned_by: user.id,
            status: 'confirmed'
          })
          .select()
          .single();

        if (assignmentError) {
          throw new Error(`Failed to create shift assignment: ${assignmentError.message}`);
        }

        // Create schedule entry to show in "My Schedule"
        const { data: scheduleData, error: scheduleError } = await supabase
          .from('schedules')
          .insert({
            employee_id: employeeId,
            title: openShift.title,
            start_time: openShift.start_time,
            end_time: openShift.end_time,
            status: 'confirmed',
            location: openShift.location || 'Main Location',
            calendar_id: openShift.id // Reference to original open shift
          })
          .select()
          .single();

        if (scheduleError) {
          throw new Error(`Failed to create schedule entry: ${scheduleError.message}`);
        }

        // Fetch employee details for notification
        const { data: employee, error: employeeError } = await supabase
          .from('employees')
          .select('user_id, name')
          .eq('id', employeeId)
          .single();

        if (employeeError) {
          throw new Error(`Failed to fetch employee details: ${employeeError.message}`);
        }

        // Send detailed notification to employee
        if (employee.user_id) {
          await sendNotification({
            user_id: employee.user_id,
            title: 'Shift Assigned 📅',
            message: `🕒 New Shift: "${openShift.title}" on ${new Date(openShift.start_time).toLocaleDateString()} from ${new Date(openShift.start_time).toLocaleTimeString()} to ${new Date(openShift.end_time).toLocaleTimeString()}`,
            type: 'info',
            related_entity: 'schedules',
            related_id: scheduleData.id
          });
        }

        return { assignmentData, scheduleData };
      } catch (error) {
        console.error('Shift Assignment Error:', error);
        toast.error(error instanceof Error ? error.message : 'Shift assignment failed');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['open-shifts'] });
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast.success('Shift assigned successfully 🎉');
    },
    onError: (error) => {
      console.error('Shift Assignment Error:', error);
      toast.error('Failed to assign shift. Please try again.');
    }
  });

  return { assignShift };
};
