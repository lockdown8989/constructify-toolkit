
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LeaveEvent } from '../leave-types';
import { notifyEmployeeOfLeaveStatusChange } from '@/services/notifications/leave-notifications';
import { sendNotification } from '@/services/notifications';

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
        console.error('Error updating leave request:', error);
        throw new Error(error.message);
      }

      console.log('Leave request updated successfully:', data);
      return data as LeaveEvent;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['leave-calendar'] });
      
      // If status changed to Approved or Rejected, notify the employee
      if (data.status === 'Approved' || data.status === 'Rejected') {
        try {
          console.log(`Attempting to notify employee about ${data.status.toLowerCase()} leave request`);
          
          // Send in-app notification to the employee
          await sendNotification({
            user_id: data.employee_id,
            title: `Leave request ${data.status.toLowerCase()}`,
            message: `Your ${data.type} leave request from ${data.start_date} to ${data.end_date} has been ${data.status.toLowerCase()}.`,
            type: data.status === 'Approved' ? 'success' : 'warning',
            related_entity: 'leave_calendar',
            related_id: data.id
          });
          
          // Also send email notification if configured
          const notificationResult = await notifyEmployeeOfLeaveStatusChange(data, data.status as 'Approved' | 'Rejected');
          console.log('Employee notification completed with result:', notificationResult);
        } catch (notifyError) {
          console.error('Error notifying employee:', notifyError);
          // Continue execution even if notification fails
        }
      }
      
      toast({
        title: 'Leave request updated',
        description: 'The leave request has been successfully updated.',
      });
    },
    onError: (error: any) => {
      console.error('Error in useUpdateLeaveRequest:', error);
      toast({
        title: 'Failed to update leave request',
        description: error.message || 'An error occurred while updating the leave request.',
        variant: 'destructive',
      });
    }
  });
}
