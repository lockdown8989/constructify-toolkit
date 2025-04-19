
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

export const useShiftCancellation = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const cancelShift = useMutation({
    mutationFn: async (openShiftId: string) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Cancelling open shift:', openShiftId);

      const { data, error } = await supabase
        .from('open_shifts')
        .update({ status: 'cancelled' })
        .eq('id', openShiftId)
        .select()
        .single();

      if (error) {
        console.error('Error cancelling shift:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['open-shifts'] });
      toast.success('Shift cancelled successfully');
    },
    onError: (error) => {
      console.error('Failed to cancel shift:', error);
      toast.error('Failed to cancel shift. Please try again.');
    }
  });

  return { cancelShift };
};
