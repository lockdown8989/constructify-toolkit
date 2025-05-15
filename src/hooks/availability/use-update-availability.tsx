
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UpdateAvailabilityRequest, AvailabilityRequest } from '@/types/availability';
import { sendNotification } from '@/services/notifications';

export function useUpdateAvailabilityRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (update: UpdateAvailabilityRequest) => {
      const { id, ...updateData } = update;
      
      if (!id) throw new Error('ID is required for update');
      
      const { data, error } = await supabase
        .from('availability_requests')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          employees:employee_id (
            name,
            department,
            job_title
          )
        `)
        .single();
      
      if (error) {
        console.error('Error updating availability request:', error);
        throw error;
      }
      
      return data as AvailabilityRequest;
    },
    onSuccess: async (data, update) => {
      queryClient.invalidateQueries({ queryKey: ['availability_requests'] });
      queryClient.invalidateQueries({ queryKey: ['availability_request', data.id] });
      
      // Get employee details for notification
      const { data: employeeData } = await supabase
        .from('employees')
        .select('name, user_id')
        .eq('id', data.employee_id)
        .single();
      
      if (employeeData) {
        // If status was updated, notify the employee
        if (update.status === 'Approved' || update.status === 'Rejected') {
          try {
            await sendNotification({
              user_id: employeeData.user_id,
              title: `Availability Request ${update.status}`,
              message: `Your availability request for ${data.date} has been ${update.status.toLowerCase()}.`,
              type: update.status === 'Approved' ? "success" : "warning",
              related_entity: "availability_requests",
              related_id: data.id
            });
          } catch (notifyError) {
            console.error('Error notifying employee:', notifyError);
          }
        }
      }
      
      toast({
        title: "Success",
        description: "Availability request updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update availability request: ${error.message}`,
        variant: "destructive",
      });
    }
  });
}
