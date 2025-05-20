
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { sendNotification } from '@/services/notifications/notification-sender';
import { assignOpenShiftToEmployee } from '@/utils/calendar-actions';

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

        // Use the utility function that handles all the logic
        const result = await assignOpenShiftToEmployee(openShiftId, employeeId);
        
        // Make sure to invalidate both schedules and open-shifts queries
        queryClient.invalidateQueries({ queryKey: ['open-shifts'] });
        queryClient.invalidateQueries({ queryKey: ['schedules'] });
        
        return result;
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
