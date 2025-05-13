
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AvailabilityRequest } from '@/types/availability';

type UpdateRequest = {
  id: string;
  status: string;
  manager_notes?: string;
  reviewer_id?: string;
};

export const useUpdateAvailabilityRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (request: UpdateRequest) => {
      const { data, error } = await supabase
        .from('availability_requests')
        .update({
          status: request.status,
          manager_notes: request.manager_notes,
          reviewer_id: request.reviewer_id || supabase.auth.getUser().then(({ data }) => data.user?.id),
          updated_at: new Date().toISOString()
        })
        .eq('id', request.id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['availability-requests'] });
      toast({
        title: "Success",
        description: `Request ${data.status.toLowerCase()}`
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update request: ${error.message}`,
        variant: "destructive"
      });
    }
  });
};
