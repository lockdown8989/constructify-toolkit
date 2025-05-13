
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useDeleteAvailabilityRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('availability_requests')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability-requests'] });
      toast({
        title: "Success",
        description: "Request deleted"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete request: ${error.message}`,
        variant: "destructive"
      });
    }
  });
};
