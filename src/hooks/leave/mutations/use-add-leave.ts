
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { LeaveEvent, LeaveRequest } from '../leave-types';
import { notifyManagersOfNewLeaveRequest } from '@/services/notifications/leave-notifications';

/**
 * Hook for adding a new leave request
 */
export function useAddLeaveRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (newLeaveRequest: LeaveRequest) => {
      try {
        console.log('Adding leave request:', newLeaveRequest);
        
        // Verify the employee record belongs to the current user
        if (user) {
          const { data: employeeData } = await supabase
            .from('employees')
            .select('id')
            .eq('id', newLeaveRequest.employee_id)
            .eq('user_id', user.id)
            .single();
          
          if (!employeeData) {
            console.error('Employee record does not belong to current user');
            throw new Error('You can only create leave requests for yourself');
          }
        }
        
        const { data, error } = await supabase
          .from('leave_calendar')
          .insert([newLeaveRequest])
          .select()
          .single();

        if (error) {
          console.error('Error adding leave request:', error);
          throw new Error(error.message);
        }

        // Log successful data insertion
        console.log('Leave request added successfully:', data);
        return data as LeaveEvent;
      } catch (error: any) {
        console.error('Exception in useAddLeaveRequest:', error);
        throw error;
      }
    },
    onSuccess: async (data) => {
      console.log('OnSuccess handler called with data:', data);
      queryClient.invalidateQueries({ queryKey: ['leave-calendar'] });
      
      // Notify managers about the new leave request
      try {
        console.log('Attempting to notify managers about new leave request');
        const notificationResult = await notifyManagersOfNewLeaveRequest(data);
        console.log('Manager notification completed with result:', notificationResult);
      } catch (notifyError) {
        console.error('Error notifying managers:', notifyError);
        // Continue execution even if notification fails
      }
      
      toast({
        title: 'Leave request submitted',
        description: 'Your leave request has been successfully submitted and managers have been notified.',
      });
    },
    onError: (error: any) => {
      console.error('Error in useAddLeaveRequest:', error);
      toast({
        title: 'Failed to submit leave request',
        description: error.message || 'An error occurred while submitting your leave request.',
        variant: 'destructive',
      });
    }
  });
}
