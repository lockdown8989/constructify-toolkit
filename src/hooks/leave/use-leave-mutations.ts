
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { LeaveEvent, LeaveRequest } from './leave-types';

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

        return data as LeaveEvent;
      } catch (error: any) {
        console.error('Exception in useAddLeaveRequest:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-calendar'] });
      toast({
        title: 'Leave request submitted',
        description: 'Your leave request has been successfully submitted.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to submit leave request',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
}

// Add this alias for backward compatibility
export const useAddLeaveCalendar = useAddLeaveRequest;

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
        throw new Error(error.message);
      }

      return data as LeaveEvent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-calendar'] });
      toast({
        title: 'Leave request updated',
        description: 'The leave request has been successfully updated.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to update leave request',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
}

// Add this alias for backward compatibility
export const useUpdateLeaveCalendar = useUpdateLeaveRequest;

/**
 * Hook for deleting a leave request
 */
export function useDeleteLeaveRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('leave_calendar')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-calendar'] });
      toast({
        title: 'Leave request deleted',
        description: 'The leave request has been successfully deleted.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to delete leave request',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
}

// Add this alias for backward compatibility
export const useDeleteLeaveCalendar = useDeleteLeaveRequest;
