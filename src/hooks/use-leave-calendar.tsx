
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/types/supabase';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

export type LeaveCalendar = Database['public']['Tables']['leave_calendar']['Row'];
export type NewLeaveCalendar = Database['public']['Tables']['leave_calendar']['Insert'];
export type LeaveCalendarUpdate = Database['public']['Tables']['leave_calendar']['Update'];

// Get all leave records
export function useLeaveCalendar() {
  const { session } = useAuth();
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['leave_calendar'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leave_calendar')
        .select('*');
      
      if (error) {
        toast({
          title: "Error loading leave calendar",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      return data as LeaveCalendar[];
    },
    enabled: !!session // Only run query if user is authenticated
  });
}

// Get leave records for a specific employee
export function useEmployeeLeaveCalendar(employeeId: string) {
  const { session } = useAuth();
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['leave_calendar', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leave_calendar')
        .select('*')
        .eq('employee_id', employeeId);
      
      if (error) {
        toast({
          title: "Error loading employee leave records",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      return data as LeaveCalendar[];
    },
    enabled: !!session && !!employeeId // Only run query if user is authenticated and employeeId is provided
  });
}

// Add a new leave record
export function useAddLeaveCalendar() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (newLeave: NewLeaveCalendar) => {
      if (!session) {
        throw new Error("You must be logged in to add a leave request");
      }
      
      // If the employee_id isn't set, set it to the current user's ID
      if (!newLeave.employee_id && session.user) {
        newLeave.employee_id = session.user.id;
      }
      
      const { data, error } = await supabase
        .from('leave_calendar')
        .insert(newLeave)
        .select()
        .single();
      
      if (error) {
        toast({
          title: "Error adding leave request",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      return data as LeaveCalendar;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['leave_calendar'] });
      queryClient.invalidateQueries({ queryKey: ['leave_calendar', data.employee_id] });
      toast({
        title: "Leave request submitted",
        description: "Your leave request has been submitted successfully.",
      });
    }
  });
}

// Update a leave record
export function useUpdateLeaveCalendar() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, ...update }: LeaveCalendarUpdate & { id: string }) => {
      if (!session) {
        throw new Error("You must be logged in to update a leave request");
      }
      
      const { data, error } = await supabase
        .from('leave_calendar')
        .update(update)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        toast({
          title: "Error updating leave request",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      return data as LeaveCalendar;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['leave_calendar'] });
      queryClient.invalidateQueries({ queryKey: ['leave_calendar', data.employee_id] });
      toast({
        title: "Leave request updated",
        description: "The leave request has been updated successfully.",
      });
    }
  });
}

// Delete a leave record
export function useDeleteLeaveCalendar() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      if (!session) {
        throw new Error("You must be logged in to delete a leave request");
      }
      
      // First get the employee_id before deletion
      const { data: leaveData, error: fetchError } = await supabase
        .from('leave_calendar')
        .select('employee_id')
        .eq('id', id)
        .single();
      
      if (fetchError) {
        toast({
          title: "Error fetching leave request",
          description: fetchError.message,
          variant: "destructive",
        });
        throw fetchError;
      }
      
      const employeeId = leaveData?.employee_id;
      
      const { error: deleteError } = await supabase
        .from('leave_calendar')
        .delete()
        .eq('id', id);
      
      if (deleteError) {
        toast({
          title: "Error deleting leave request",
          description: deleteError.message,
          variant: "destructive",
        });
        throw deleteError;
      }
      
      return { id, employeeId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['leave_calendar'] });
      if (result.employeeId) {
        queryClient.invalidateQueries({ queryKey: ['leave_calendar', result.employeeId] });
      }
      toast({
        title: "Leave request deleted",
        description: "The leave request has been deleted successfully.",
      });
    }
  });
}
