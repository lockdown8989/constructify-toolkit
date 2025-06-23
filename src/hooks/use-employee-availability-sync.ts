
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AvailabilityUpdate {
  employeeId: string;
  monday_available?: boolean;
  monday_start_time?: string;
  monday_end_time?: string;
  tuesday_available?: boolean;
  tuesday_start_time?: string;
  tuesday_end_time?: string;
  wednesday_available?: boolean;
  wednesday_start_time?: string;
  wednesday_end_time?: string;
  thursday_available?: boolean;
  thursday_start_time?: string;
  thursday_end_time?: string;
  friday_available?: boolean;
  friday_start_time?: string;
  friday_end_time?: string;
  saturday_available?: boolean;
  saturday_start_time?: string;
  saturday_end_time?: string;
  sunday_available?: boolean;
  sunday_start_time?: string;
  sunday_end_time?: string;
}

export const useEmployeeAvailabilitySync = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateAvailability = useMutation({
    mutationFn: async (data: AvailabilityUpdate) => {
      const { employeeId, ...availabilityData } = data;
      
      const { error } = await supabase
        .from('employees')
        .update(availabilityData)
        .eq('id', employeeId);

      if (error) {
        throw error;
      }

      return { success: true };
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['restaurant-schedule'] });
      
      toast({
        title: "Availability Updated",
        description: "Employee availability has been successfully updated.",
      });
    },
    onError: (error: Error) => {
      console.error('Error updating availability:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update employee availability. Please try again.",
        variant: "destructive",
      });
    }
  });

  return {
    updateAvailability: updateAvailability.mutate,
    isUpdating: updateAvailability.isPending
  };
};
