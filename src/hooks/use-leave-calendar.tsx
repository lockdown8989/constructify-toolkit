
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/types/supabase';

export type LeaveCalendar = Database['public']['Tables']['leave_calendar']['Row'];
export type NewLeaveCalendar = Database['public']['Tables']['leave_calendar']['Insert'];
export type LeaveCalendarUpdate = Database['public']['Tables']['leave_calendar']['Update'];

// Get all leave records
export function useLeaveCalendar() {
  return useQuery({
    queryKey: ['leave_calendar'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leave_calendar')
        .select('*');
      
      if (error) throw error;
      return data as LeaveCalendar[];
    }
  });
}

// Get leave records for a specific employee
export function useEmployeeLeaveCalendar(employeeId: string) {
  return useQuery({
    queryKey: ['leave_calendar', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leave_calendar')
        .select('*')
        .eq('employee_id', employeeId);
      
      if (error) throw error;
      return data as LeaveCalendar[];
    },
    enabled: !!employeeId
  });
}

// Add a new leave record
export function useAddLeaveCalendar() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newLeave: NewLeaveCalendar) => {
      const { data, error } = await supabase
        .from('leave_calendar')
        .insert(newLeave)
        .select()
        .single();
      
      if (error) throw error;
      return data as LeaveCalendar;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leave_calendar'] });
      queryClient.invalidateQueries({ queryKey: ['leave_calendar', variables.employee_id] });
    }
  });
}

// Update a leave record
export function useUpdateLeaveCalendar() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...update }: LeaveCalendarUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('leave_calendar')
        .update(update)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as LeaveCalendar;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['leave_calendar'] });
      queryClient.invalidateQueries({ queryKey: ['leave_calendar', data.employee_id] });
    }
  });
}

// Delete a leave record
export function useDeleteLeaveCalendar() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // First get the employee_id before deletion
      const { data: leaveData } = await supabase
        .from('leave_calendar')
        .select('employee_id')
        .eq('id', id)
        .single();
      
      const employeeId = leaveData?.employee_id;
      
      const { error } = await supabase
        .from('leave_calendar')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { id, employeeId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['leave_calendar'] });
      if (result.employeeId) {
        queryClient.invalidateQueries({ queryKey: ['leave_calendar', result.employeeId] });
      }
    }
  });
}
