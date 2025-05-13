
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Delete an availability request
export function useDeleteAvailabilityRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // Get the employee_id before deletion
      const { data: requestData } = await supabase
        .from('availability_requests')
        .select('employee_id')
        .eq('id', id)
        .single();
      
      const employeeId = requestData?.employee_id;
      
      const { error } = await supabase
        .from('availability_requests')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting availability request:', error);
        throw error;
      }
      return { id, employeeId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['availability-requests'] });
      if (result.employeeId) {
        queryClient.invalidateQueries({ queryKey: ['availability_requests', result.employeeId] });
      }
      toast({
        title: "Success",
        description: "Availability request deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete availability request: ${error.message}`,
        variant: "destructive",
      });
    }
  });
}
