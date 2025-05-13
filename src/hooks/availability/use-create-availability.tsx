
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AvailabilityRequest } from '@/types/availability';

// Update the type definition to match what's expected in the form
type NewAvailability = Pick<AvailabilityRequest, 'employee_id' | 'date' | 'start_time' | 'end_time' | 'is_available' | 'notes'>;

export const useCreateAvailabilityRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (newRequest: NewAvailability) => {
      const { data, error } = await supabase
        .from('availability_requests')
        .insert([{
          ...newRequest,
          status: 'Pending',
          manager_notes: null,
          reviewer_id: null
        }])
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability-requests'] });
      toast({
        title: "Success",
        description: "Availability request submitted"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to submit request: ${error.message}`,
        variant: "destructive" 
      });
    }
  });
};
