
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LeaveEvent } from '../leave-types';

/**
 * Hook for updating an existing leave request
 */
export function useUpdateLeaveRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<LeaveEvent> & { id: string }) => {
      const { data, error } = await supabase
        .from('leave_calendar')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data as LeaveEvent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-calendar'] });
      toast({
        title: 'Leave request updated',
        description: 'The leave request has been successfully updated.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to update leave request',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
}
