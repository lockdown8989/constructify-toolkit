
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { LeaveCalendar } from "./types";

/**
 * Hook to fetch all leave requests for the current user
 */
export const useUserLeaveRequests = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['leave-requests', 'user', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('leave_calendar')
        .select('*')
        .eq('employee_id', user.id)
        .order('start_date', { ascending: false });
        
      if (error) throw error;
      return data as LeaveCalendar[];
    },
    enabled: !!user,
  });
};

/**
 * Hook to fetch a single leave request by ID
 */
export const useLeaveRequestById = (id: string | undefined) => {
  return useQuery({
    queryKey: ['leave-requests', id],
    queryFn: async () => {
      if (!id) throw new Error('Leave request ID is required');
      
      const { data, error } = await supabase
        .from('leave_calendar')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data as LeaveCalendar;
    },
    enabled: !!id,
  });
};

/**
 * Hook to fetch all leave requests (admin/HR only)
 */
export const useAllLeaveRequests = (filters?: {
  status?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const { isAdmin, isHR } = useAuth();
  
  return useQuery({
    queryKey: ['leave-requests', 'all', filters],
    queryFn: async () => {
      if (!isAdmin && !isHR) {
        throw new Error('Unauthorized access');
      }
      
      let query = supabase
        .from('leave_calendar')
        .select('*, profiles(first_name, last_name)');
      
      // Apply filters if provided
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      
      if (filters?.startDate) {
        query = query.gte('start_date', filters.startDate);
      }
      
      if (filters?.endDate) {
        query = query.lte('end_date', filters.endDate);
      }
      
      const { data, error } = await query.order('start_date', { ascending: false });
        
      if (error) throw error;
      return data as (LeaveCalendar & { profiles: { first_name: string; last_name: string } })[];
    },
    enabled: !!(isAdmin || isHR),
  });
};

/**
 * Hook to fetch leave calendar for a date range
 */
export const useLeaveCalendar = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['leave-calendar', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leave_calendar')
        .select('*, profiles(first_name, last_name)')
        .or(`start_date.gte.${startDate},end_date.gte.${startDate}`)
        .lt('start_date', endDate)
        .eq('status', 'Approved');
        
      if (error) throw error;
      return data as (LeaveCalendar & { profiles: { first_name: string; last_name: string } })[];
    },
  });
};

/**
 * Hook to check for leave request conflicts with projects
 */
export const useLeaveProjectConflicts = (employeeId: string, startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['leave-conflicts', employeeId, startDate, endDate],
    queryFn: async () => {
      // This is a placeholder for project conflict checking logic
      // In a real implementation, you would query the projects table and check for conflicts
      return [];
    },
    enabled: !!(employeeId && startDate && endDate),
  });
};
