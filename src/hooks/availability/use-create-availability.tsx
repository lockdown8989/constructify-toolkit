
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AvailabilityRequest } from '@/types/availability';

type NewAvailability = Omit<AvailabilityRequest, 'id' | 'created_at' | 'updated_at' | 'status'>;

export const useCreateAvailabilityRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (newRequest: NewAvailability) => {
      const { data, error } = await supabase
        .from('availability_requests')
        .insert([{
          ...newRequest,
          status: 'Pending'
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
