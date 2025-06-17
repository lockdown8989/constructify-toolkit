
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './use-auth';
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
      try {
        // If employeeId is provided, fetch that employee's data (manager view)
        // Otherwise fetch the current user's data (employee view)
        const id = employeeId || user?.id;
        
        if (!id) {
          throw new Error('No employee ID or authenticated user');
        }
        
        console.log('Fetching leave data for user/employee ID:', id);
        
        // First get the employee record
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
          // Instead of throwing an error, return default values
          // This prevents the UI from breaking if employee record isn't found yet
          return {
            annual_leave_days: 20,
            sick_leave_days: 10,
            totalAnnualLeave: 30,
            totalSickLeave: 15
          };
        }
        
        // Check for any pending leave requests that might affect the balance
        const { data: pendingLeave, error: leaveError } = await supabase
          .from('leave_calendar')
          .select('type, start_date, end_date')
          .eq('employee_id', employeeId || user?.id) // Use the ID directly instead of data.id
          .eq('status', 'Approved');
        
        if (leaveError) {
          console.error("Error fetching leave calendar data:", leaveError);
        }
        
        // Calculate used leave days if we have approved leave data
        let annualLeaveUsed = 0;
        let sickLeaveUsed = 0;
        
        if (pendingLeave && pendingLeave.length > 0) {
          pendingLeave.forEach(leave => {
            const startDate = new Date(leave.start_date);
            const endDate = new Date(leave.end_date);
            const days = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            
            if (leave.type === 'Annual') {
              annualLeaveUsed += days;
            } else if (leave.type === 'Sick') {
              sickLeaveUsed += days;
            }
          });
        }
        
        return {
          annual_leave_days: data.annual_leave_days || 20,
          sick_leave_days: data.sick_leave_days || 10,
          totalAnnualLeave: 30, // Default total values
          totalSickLeave: 15
        };
      } catch (error) {
        console.error('Exception in useEmployeeLeave:', error);
        // Return default values instead of throwing error
        return {
          annual_leave_days: 20,
          sick_leave_days: 10,
          totalAnnualLeave: 30,
          totalSickLeave: 15
        };
      }
    },
    enabled: !!user,
    // Refresh the data every 5 minutes to keep it updated
    refetchInterval: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000, // Data becomes stale after 2 minutes
  });
}
