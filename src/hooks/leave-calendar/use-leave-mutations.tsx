
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { LeaveCalendar, NewLeaveCalendar, LeaveCalendarUpdate } from "./types";

/**
 * Hook for creating a new leave request
 */
export const useCreateLeaveRequest = () => {
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
      toast({
        title: "Leave request created",
        description: "Your leave request has been submitted successfully.",
      });
    },
    onError: (error) => {
      console.error("Error creating leave request:", error);
      toast({
        title: "Failed to create leave request",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook for updating a leave request
 */
export const useUpdateLeaveRequest = () => {
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
      toast({
        title: "Leave request updated",
        description: "The leave request has been updated successfully.",
      });
    },
    onError: (error) => {
      console.error("Error updating leave request:", error);
      toast({
        title: "Failed to update leave request",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook for deleting a leave request
 */
export const useDeleteLeaveRequest = () => {
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
      toast({
        title: "Leave request deleted",
        description: "The leave request has been deleted successfully.",
      });
    },
    onError: (error) => {
      console.error("Error deleting leave request:", error);
      toast({
        title: "Failed to delete leave request",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook for approving or rejecting a leave request
 */
export const useProcessLeaveRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: 'Approved' | 'Rejected'; notes?: string }) => {
      const timestamp = new Date().toISOString();
      const { data: currentLeave, error: fetchError } = await supabase
        .from('leave_calendar')
        .select('audit_log')
        .eq('id', id)
        .single();
      
      if (fetchError) throw fetchError;
      
      const auditLog = currentLeave?.audit_log || [];
      const newAuditEntry = {
        timestamp,
        action: `Status changed to ${status}`,
        notes: notes || ''
      };
      
      const { data, error } = await supabase
        .from('leave_calendar')
        .update({ 
          status, 
          audit_log: [...auditLog, newAuditEntry],
          ...(notes && { notes })
        })
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data as LeaveCalendar;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      toast({
        title: `Leave request ${variables.status.toLowerCase()}`,
        description: `The leave request has been ${variables.status.toLowerCase()} successfully.`,
      });
    },
    onError: (error) => {
      console.error("Error processing leave request:", error);
      toast({
        title: "Failed to process leave request",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });
};
