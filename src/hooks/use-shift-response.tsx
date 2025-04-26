
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { toast } from '@/hooks/use-toast';
import { ScheduleStatus } from '@/types/supabase/schedules';

export const useShiftResponse = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const respondToShift = useMutation({
    mutationFn: async ({ 
      scheduleId, 
      response 
    }: { 
      scheduleId: string, 
      response: 'accepted' | 'rejected'
    }) => {
      try {
        if (!user) {
          throw new Error('User not authenticated');
        }

        console.log(`Processing shift response: ${response} for schedule ID: ${scheduleId}`);

        // Map the response to the correct status enum value
        const statusValue: ScheduleStatus = response === 'accepted' ? 'employee_accepted' : 'employee_rejected';

        // Update the shift status in Supabase
        const { data: scheduleData, error: updateError } = await supabase
          .from('schedules')
          .update({
            status: statusValue,
            updated_at: new Date().toISOString()
          })
          .eq('id', scheduleId)
          .select('*')
          .single();

        if (updateError) {
          console.error('Error updating shift status:', updateError);
          throw new Error(`Failed to update shift status: ${updateError.message}`);
        }

        console.log('Schedule data after update:', scheduleData);
        return scheduleData;
      } catch (error) {
        console.error('Error responding to shift:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Refresh the schedules data after successful response
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
    onError: (error) => {
      // Add a user-friendly error toast
      toast({
        title: 'Shift Response Failed',
        description: error instanceof Error ? error.message : 'Unable to process your shift response.',
        variant: 'destructive',
      });
    }
  });

  return { respondToShift };
};
