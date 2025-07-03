
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { sendNotification } from '@/services/notifications/notification-sender';

interface CreateAvailabilityData {
  employee_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  notes?: string;
}

export const useCreateAvailability = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateAvailabilityData) => {
      const { data: result, error } = await supabase
        .from('availability_requests')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability'] });
      toast({
        title: "Availability request created",
        description: "Your availability request has been submitted successfully.",
      });
    },
    onError: (error) => {
      console.error('Error creating availability request:', error);
      toast({
        title: "Error",
        description: "Failed to create availability request. Please try again.",
        variant: "destructive",
      });
    },
  });
};
