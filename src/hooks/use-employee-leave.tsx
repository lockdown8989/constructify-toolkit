import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './auth';
import { useToast } from './use-toast';

export interface LeaveData {
  annual_leave_days: number;
  sick_leave_days: number;
  totalAnnualLeave?: number;
  totalSickLeave?: number;
}

export function useEmployeeLeave(employeeId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['employee-leave', employeeId || user?.id],
    queryFn: async (): Promise<LeaveData> => {
      // If employeeId is provided, fetch that employee's data (manager view)
      // Otherwise fetch the current user's data (employee view)
      const id = employeeId || user?.id;
      
      if (!id) {
        throw new Error('No employee ID or authenticated user');
      }
      
      let query = supabase
        .from('employees')
        .select('annual_leave_days, sick_leave_days');
      
      if (employeeId) {
        // For manager viewing an employee
        query = query.eq('id', employeeId);
      } else {
        // For employee viewing their own data
        query = query.eq('user_id', id);
      }
      
      const { data, error } = await query.single();
      
      if (error) {
        console.error("Error fetching leave data:", error);
        toast({
          title: "Error",
          description: "Could not fetch leave data",
          variant: "destructive"
        });
        throw error;
      }
      
      return {
        annual_leave_days: data.annual_leave_days || 20,
        sick_leave_days: data.sick_leave_days || 10,
        totalAnnualLeave: 30, // Default total values
        totalSickLeave: 15
      };
    },
    enabled: !!employeeId || !!user?.id
  });
}
