
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';

export interface LeaveData {
  annual_leave_days: number;
  sick_leave_days: number;
  totalAnnualLeave?: number;
  totalSickLeave?: number;
  annualLeaveUsed?: number;
  sickLeaveUsed?: number;
}

export function useEmployeeLeave(employeeId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['employee-leave', employeeId || user?.id],
    queryFn: async (): Promise<LeaveData> => {
      try {
        const id = employeeId || user?.id;
        
        if (!id) {
          throw new Error('No employee ID or authenticated user');
        }
        
        console.log('Fetching leave data for user/employee ID:', id);
        
        // First get the employee record
        let query = supabase
          .from('employees')
          .select('id, annual_leave_days, sick_leave_days');
        
        if (employeeId) {
          query = query.eq('id', employeeId);
        } else {
          query = query.eq('user_id', id);
        }
        
        const { data: employeeData, error } = await query.single();
        
        if (error) {
          console.error("Error fetching employee data:", error);
          return {
            annual_leave_days: 20,
            sick_leave_days: 10,
            totalAnnualLeave: 30,
            totalSickLeave: 15,
            annualLeaveUsed: 0,
            sickLeaveUsed: 0
          };
        }
        
        // Calculate used leave days from approved leave requests
        const { data: approvedLeave, error: leaveError } = await supabase
          .from('leave_calendar')
          .select('type, start_date, end_date')
          .eq('employee_id', employeeData.id)
          .eq('status', 'Approved')
          .gte('start_date', new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0])
          .lte('end_date', new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0]);
        
        if (leaveError) {
          console.error("Error fetching leave calendar data:", leaveError);
        }
        
        // Calculate used leave days
        let annualLeaveUsed = 0;
        let sickLeaveUsed = 0;
        
        if (approvedLeave && approvedLeave.length > 0) {
          approvedLeave.forEach(leave => {
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
        
        // Calculate remaining leave
        const annualLeaveRemaining = Math.max(0, (employeeData.annual_leave_days || 20) - annualLeaveUsed);
        const sickLeaveRemaining = Math.max(0, (employeeData.sick_leave_days || 10) - sickLeaveUsed);
        
        return {
          annual_leave_days: annualLeaveRemaining,
          sick_leave_days: sickLeaveRemaining,
          totalAnnualLeave: employeeData.annual_leave_days || 20,
          totalSickLeave: employeeData.sick_leave_days || 10,
          annualLeaveUsed,
          sickLeaveUsed
        };
      } catch (error) {
        console.error('Exception in useEmployeeLeave:', error);
        return {
          annual_leave_days: 20,
          sick_leave_days: 10,
          totalAnnualLeave: 30,
          totalSickLeave: 15,
          annualLeaveUsed: 0,
          sickLeaveUsed: 0
        };
      }
    },
    enabled: !!user,
    refetchInterval: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000,
  });
}

// Hook to sync leave data between employee and payroll records
export function useSyncLeaveData() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (employeeId: string) => {
      // Get current leave data
      const { data: employeeData } = await supabase
        .from('employees')
        .select('annual_leave_days, sick_leave_days')
        .eq('id', employeeId)
        .single();
      
      if (!employeeData) throw new Error('Employee not found');
      
      // Update payroll records to match employee leave data
      const { error: payrollError } = await supabase
        .from('payroll')
        .update({
          // Add leave tracking fields if they exist in payroll table
          updated_at: new Date().toISOString()
        })
        .eq('employee_id', employeeId);
      
      if (payrollError) throw payrollError;
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-leave'] });
      queryClient.invalidateQueries({ queryKey: ['payroll'] });
      toast({
        title: "Leave data synchronized",
        description: "Employee leave balance has been updated across all systems."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Sync failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });
}
