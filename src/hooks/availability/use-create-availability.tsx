
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { NewAvailabilityRequest, AvailabilityRequest } from '@/types/availability';
import { sendNotification } from '@/services/notifications';

// Create a new availability request
export function useCreateAvailabilityRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (newRequest: NewAvailabilityRequest) => {
      console.log('Creating availability request:', newRequest);
      
      const { data, error } = await supabase
        .from('availability_requests')
        .insert({
          ...newRequest,
          status: newRequest.status || 'Pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating availability request:', error);
        throw error;
      }
      
      console.log('Created availability request:', data);
      return data as AvailabilityRequest;
    },
    onSuccess: async (data) => {
      console.log('Availability request created successfully:', data);
      
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['availability-requests'] });
      queryClient.invalidateQueries({ queryKey: ['availability_requests', data.employee_id] });
      
      // Get employee details for notification
      const { data: employeeData } = await supabase
        .from('employees')
        .select('name')
        .eq('id', data.employee_id)
        .single();
      
      const employeeName = employeeData?.name || 'An employee';
      
      // Notify managers about the new request
      try {
        // Get all manager user ids
        const { data: managerRoles } = await supabase
          .from('user_roles')
          .select('user_id')
          .in('role', ['admin', 'employer', 'hr']);
        
        console.log('Manager roles found:', managerRoles);
        
        if (managerRoles && managerRoles.length > 0) {
          console.log(`Sending notifications to ${managerRoles.length} managers`);
          
          // Send notification to each manager
          for (const manager of managerRoles) {
            console.log('Sending notification to manager:', manager.user_id);
            await sendNotification({
              user_id: manager.user_id,
              title: "New Availability Request",
              message: `${employeeName} has submitted a new availability request for ${data.date}`,
              type: "info",
              related_entity: "availability_requests",
              related_id: data.id
            });
          }
        } else {
          console.log('No managers found to notify');
        }
      } catch (notifyError) {
        console.error('Error notifying managers:', notifyError);
        // Continue execution even if notification fails
      }
      
      toast({
        title: "Success",
        description: "Availability request submitted successfully",
      });
    },
    onError: (error: Error) => {
      console.error('Error in availability request mutation:', error);
      
      toast({
        title: "Error",
        description: `Failed to submit availability request: ${error.message}`,
        variant: "destructive",
      });
    }
  });
}
