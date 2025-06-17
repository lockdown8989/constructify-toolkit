
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { toast } from '@/hooks/use-toast';

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
        const statusValue = response === 'accepted' ? 'employee_accepted' : 'employee_rejected';

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

        console.log('Schedule updated successfully:', scheduleData);
        return scheduleData;
      } catch (error) {
        console.error('Error responding to shift:', error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      // Refresh the schedules data after successful response
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      
      console.log('Shift response successful, data refreshed');
    },
    onError: (error) => {
      console.error('Shift response error:', error);
      // The error toast is handled in the component
    }
  });

  return { respondToShift };
};
