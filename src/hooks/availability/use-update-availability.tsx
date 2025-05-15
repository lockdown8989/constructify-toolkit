
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UpdateAvailabilityParams {
  id: string;
  is_available?: boolean;
  notes?: string;
  status?: string;
}

export const useUpdateAvailability = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateAvailability = async (params: UpdateAvailabilityParams) => {
    const { data, error } = await supabase
      .from('availability_requests')
      .update({
        is_available: params.is_available,
        notes: params.notes,
        status: params.status,
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const mutation = useMutation({
    mutationFn: updateAvailability,
    onSuccess: () => {
      toast({
        title: 'Availability Updated',
        description: 'Your availability has been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['availability'] });
    },
    onError: (error) => {
      console.error('Error updating availability:', error);
      toast({
        title: 'Error',
        description: 'Failed to update availability. Please try again.',
        variant: 'destructive',
      });
    },
  });

  return {
    updateAvailability: mutation.mutate,
    isUpdating: mutation.isPending,
  };
};
