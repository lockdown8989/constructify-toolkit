
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { NewAvailabilityRequest } from '@/types/availability';

export const useCreateAvailability = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  const createAvailability = async (params: NewAvailabilityRequest) => {
    // If employee_id is not provided, get the employee ID for the current user
    if (!params.employee_id) {
      const { data: employeeData } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (!employeeData) {
        throw new Error('No employee record found for current user');
      }
      
      params.employee_id = employeeData.id;
    }

    const { data, error } = await supabase
      .from('availability_requests')
      .insert({
        date: params.date,
        start_time: params.start_time,
        end_time: params.end_time,
        is_available: params.is_available,
        notes: params.notes || '',
        employee_id: params.employee_id,
        status: 'Pending'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  return useMutation({
    mutationFn: createAvailability,
    onSuccess: () => {
      toast({
        title: 'Availability Created',
        description: 'Your availability has been submitted successfully.',
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
};
