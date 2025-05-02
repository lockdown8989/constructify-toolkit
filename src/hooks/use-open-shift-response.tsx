
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { isAfter, parseISO } from 'date-fns';

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
        // First check if the shift has expired
        const { data: openShift, error: shiftError } = await supabase
          .from('open_shifts')
          .select('*')
          .eq('id', shiftId)
          .single();
            
        if (shiftError) throw shiftError;
        
        // Check if the shift has expired
        if (openShift.expiration_date && isAfter(new Date(), parseISO(openShift.expiration_date))) {
          throw new Error("This shift has expired and is no longer available for response.");
        }

        const { error } = await supabase
          .from('open_shift_assignments')
          .update({ 
            status: response,
            updated_at: new Date().toISOString()
          })
          .eq('open_shift_id', shiftId)
          .eq('employee_id', employeeId);

        if (error) throw error;

        // If the shift was confirmed, also create a schedule entry for the employee
        if (response === 'confirmed') {
          // Create a schedule entry for the confirmed shift
          const { error: scheduleError } = await supabase
            .from('schedules')
            .insert({
              employee_id: employeeId,
              title: openShift.title || 'Open Shift',
              start_time: openShift.start_time,
              end_time: openShift.end_time,
              status: 'employee_accepted',
              location: openShift.location
            });
            
          if (scheduleError) throw scheduleError;
        }

        return { success: true, response };
      } catch (error) {
        console.error('Error responding to open shift:', error);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['open-shifts'] });
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      
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
      console.error('Error in open shift response:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to respond to the shift. Please try again.',
        variant: 'destructive',
      });
    }
  });

  return { respondToOpenShift };
};
