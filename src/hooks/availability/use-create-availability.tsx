
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreateAvailabilityParams {
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  notes?: string;
}

export const useCreateAvailability = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createAvailability = async (params: CreateAvailabilityParams) => {
    const { data, error } = await supabase
      .from('availability_requests')
      .insert({
        date: params.date,
        start_time: params.start_time,
        end_time: params.end_time,
        is_available: params.is_available,
        notes: params.notes || '',
        employee_id: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const mutation = useMutation({
    mutationFn: createAvailability,
    onSuccess: () => {
      toast({
        title: 'Availability Created',
        description: 'Your availability has been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['availability'] });
    },
    onError: (error) => {
      console.error('Error creating availability:', error);
      toast({
        title: 'Error',
        description: 'Failed to create availability. Please try again.',
        variant: 'destructive',
      });
    },
  });

  return {
    createAvailability: mutation.mutate,
    isCreating: mutation.isPending,
  };
};
