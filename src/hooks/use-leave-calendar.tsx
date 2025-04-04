
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

export type LeaveEvent = {
  id: string;
  employee_id: string;
  type: string;
  start_date: string;
  end_date: string;
  status: string;
  notes?: string;
  audit_log?: any[];
};

// Export this as LeaveCalendar for backward compatibility
export type LeaveCalendar = LeaveEvent;

export type LeaveRequest = Omit<LeaveEvent, 'id'>;

export function useLeaveCalendar() {
  const { user, isManager } = useAuth();
  
  return useQuery({
    queryKey: ['leave-calendar', isManager, user?.id],
    queryFn: async () => {
      let query = supabase
        .from('leave_calendar')
        .select(`
          *,
          employees:employee_id (
            name,
            job_title,
            department
          )
        `);
      
      // If not a manager, only fetch the user's own leave requests
      if (!isManager && user) {
        // First get the employee ID for the current user
        const { data: employeeData } = await supabase
          .from('employees')
          .select('id')
          .eq('user_id', user.id)
          .single();
          
        if (employeeData) {
          // Filter to show only this employee's leave requests
          query = query.eq('employee_id', employeeData.id);
        } else {
          // If no employee record found, return empty array
          return [];
        }
      }
            
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useAddLeaveRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (newLeaveRequest: LeaveRequest) => {
      const { data, error } = await supabase
        .from('leave_calendar')
        .insert([newLeaveRequest])
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
