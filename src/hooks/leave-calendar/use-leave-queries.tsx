
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import type { LeaveCalendar } from './types';

// Get all leave records
export function useLeaveCalendar() {
  const { session } = useAuth();
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['leave_calendar'],
    queryFn: async () => {
      if (!session) {
        throw new Error("Authentication required");
      }
      
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
      if (!session) {
        throw new Error("Authentication required");
      }
      
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
