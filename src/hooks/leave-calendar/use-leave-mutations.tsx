
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { LeaveCalendar, NewLeaveCalendar, LeaveCalendarUpdate } from "./types";

/**
 * Hook for creating a new leave request
 */
export const useAddLeaveCalendar = () => {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['leave-calendar'] });
    },
  });
};

/**
 * Hook for updating a leave request
 */
export const useUpdateLeaveCalendar = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: LeaveCalendarUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('leave_calendar')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data as LeaveCalendar;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['leave-calendar'] });
    },
  });
};

/**
 * Hook for deleting a leave request
 */
export const useDeleteLeaveCalendar = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('leave_calendar')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['leave-calendar'] });
    },
  });
};

// For backward compatibility, export the old function names
export const useCreateLeaveRequest = useAddLeaveCalendar;
export const useUpdateLeaveRequest = useUpdateLeaveCalendar;
export const useDeleteLeaveRequest = useDeleteLeaveCalendar;
export const useProcessLeaveRequest = useUpdateLeaveCalendar;
