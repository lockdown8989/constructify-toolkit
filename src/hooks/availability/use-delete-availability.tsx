
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useDeleteAvailability = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deleteAvailability = async (id: string) => {
    const { error } = await supabase
      .from('availability_requests')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  };

  const mutation = useMutation({
    mutationFn: deleteAvailability,
    onSuccess: () => {
      toast({
        title: 'Availability Deleted',
        description: 'Your availability entry has been deleted.',
      });
      queryClient.invalidateQueries({ queryKey: ['availability'] });
    },
    onError: (error) => {
      console.error('Error deleting availability:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete availability. Please try again.',
        variant: 'destructive',
      });
    },
  });

  return {
    deleteAvailability: mutation.mutate,
    isDeleting: mutation.isPending,
  };
};
