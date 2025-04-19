
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

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

        // Update the shift status in Supabase
        const { data: scheduleData, error: updateError } = await supabase
          .from('schedules')
          .update({
            status: response === 'accepted' ? 'confirmed' : 'rejected',
            updated_at: new Date().toISOString()
          })
          .eq('id', scheduleId)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating shift status:', updateError);
          throw new Error(`Failed to update shift status: ${updateError.message}`);
        }

        console.log('Successfully updated shift status:', response);
        return scheduleData;
      } catch (error) {
        console.error('Error responding to shift:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Refresh the schedules data after successful response
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    }
  });

  return { respondToShift };
};
