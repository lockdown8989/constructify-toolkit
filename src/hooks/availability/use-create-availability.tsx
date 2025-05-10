
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { NewAvailabilityRequest } from '@/types/availability';
import { getManagerUserIds } from '@/services/notifications/role-utils';
import { sendNotificationToMany } from '@/services/notifications/notification-sender';

export function useCreateAvailabilityRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (newRequest: NewAvailabilityRequest) => {
      console.log('Creating availability request:', newRequest);
      
      // Validate input
      if (!newRequest.employee_id) {
        throw new Error('Employee ID is required');
      }
      
      if (!newRequest.date) {
        throw new Error('Date is required');
      }
      
      if (!newRequest.start_time || !newRequest.end_time) {
        throw new Error('Start and end times are required');
      }
      
      // Set default status if not provided
      const requestToCreate = {
        ...newRequest,
        status: newRequest.status || 'Pending'
      };
      
      const { data, error } = await supabase
        .from('availability_requests')
        .insert([requestToCreate])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating availability request:', error);
        throw error;
      }
      
      console.log('Availability request created:', data);
      return data;
    },
    onSuccess: async (data) => {
      // Invalidate queries to update UI
      queryClient.invalidateQueries({ queryKey: ['availability_requests'] });
      
      // Notify managers
      try {
        const managerIds = await getManagerUserIds();
        console.log('Notifying managers about new availability request:', managerIds);
        
        if (managerIds.length > 0) {
          await sendNotificationToMany(managerIds, {
            title: 'New Availability Request',
            message: 'An employee has submitted a new availability request.',
            type: 'info',
            related_entity: 'availability_requests',
            related_id: data.id
          });
        }
      } catch (notifyError) {
        console.error('Error notifying managers:', notifyError);
      }
      
      toast({
        title: 'Availability request submitted',
        description: 'Your availability request has been submitted successfully.',
      });
    },
    onError: (error: Error) => {
      console.error('Error in useCreateAvailabilityRequest:', error);
      toast({
        title: 'Error',
        description: `Failed to submit availability request: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
}
