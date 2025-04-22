
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useOpenShiftResponse = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const respondToOpenShift = useMutation({
    mutationFn: async ({ 
      shiftId, 
      employeeId, 
      response 
    }: { 
      shiftId: string;
      employeeId: string;
      response: 'confirmed' | 'rejected';
    }) => {
      try {
        const { error } = await supabase
          .from('open_shift_assignments')
          .update({ 
            status: response,
            updated_at: new Date().toISOString()
          })
          .eq('open_shift_id', shiftId)
          .eq('employee_id', employeeId);

        if (error) throw error;

        return { success: true };
      } catch (error) {
        console.error('Error responding to open shift:', error);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['open-shifts'] });
      
      // Show success message
      toast({
        title: variables.response === 'confirmed' ? 'Shift Accepted' : 'Shift Declined',
        description: variables.response === 'confirmed' 
          ? 'You have successfully accepted the open shift.'
          : 'You have declined the open shift.',
        variant: variables.response === 'confirmed' ? 'default' : 'destructive',
      });
    },
    onError: (error) => {
      console.error('Error in shift response:', error);
      toast({
        title: 'Error',
        description: 'Failed to respond to the shift. Please try again.',
        variant: 'destructive',
      });
    }
  });

  return { respondToOpenShift };
};
