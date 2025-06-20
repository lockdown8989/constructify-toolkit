
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';
import { useEffect } from 'react';

export interface LeaveData {
  annual_leave_days: number;
  sick_leave_days: number;
  totalAnnualLeave?: number;
  totalSickLeave?: number;
}

export function useEmployeeLeave(employeeId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const query = useQuery({
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
        
        // First get the employee record with enhanced data
        let query = supabase
          .from('employees')
          .select(`
            annual_leave_days, 
            sick_leave_days,
            salary,
            status,
            manager_id
          `);
        
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
          // Return default values to prevent UI breaking
          return {
            annual_leave_days: 20,
            sick_leave_days: 10,
            totalAnnualLeave: 30,
            totalSickLeave: 15
          };
        }
        
        // Get current year's leave usage for accurate calculations
        const currentYear = new Date().getFullYear();
        const yearStart = `${currentYear}-01-01`;
        const yearEnd = `${currentYear}-12-31`;
        
        // Check for approved leave requests that affect the balance
        const { data: approvedLeave, error: leaveError } = await supabase
          .from('leave_calendar')
          .select('type, start_date, end_date, status')
          .eq('employee_id', employeeId || id)
          .eq('status', 'Approved')
          .gte('start_date', yearStart)
          .lte('end_date', yearEnd);
        
        if (leaveError) {
          console.error("Error fetching leave calendar data:", leaveError);
        }
        
        // Calculate used leave days for current year
        let annualLeaveUsed = 0;
        let sickLeaveUsed = 0;
        
        if (approvedLeave && approvedLeave.length > 0) {
          approvedLeave.forEach(leave => {
            const startDate = new Date(leave.start_date);
            const endDate = new Date(leave.end_date);
            // Calculate weekdays only (excluding weekends)
            let days = 0;
            const currentDate = new Date(startDate);
            while (currentDate <= endDate) {
              const dayOfWeek = currentDate.getDay();
              if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Exclude Sunday (0) and Saturday (6)
                days++;
              }
              currentDate.setDate(currentDate.getDate() + 1);
            }
            
            if (leave.type === 'Annual') {
              annualLeaveUsed += days;
            } else if (leave.type === 'Sick') {
              sickLeaveUsed += days;
            }
          });
        }
        
        // Calculate remaining leave days
        const totalAnnualLeave = data.annual_leave_days || 30;
        const totalSickLeave = data.sick_leave_days || 15;
        const remainingAnnual = Math.max(totalAnnualLeave - annualLeaveUsed, 0);
        const remainingSick = Math.max(totalSickLeave - sickLeaveUsed, 0);
        
        return {
          annual_leave_days: remainingAnnual,
          sick_leave_days: remainingSick,
          totalAnnualLeave: totalAnnualLeave,
          totalSickLeave: totalSickLeave
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
    // Refresh more frequently for live sync
    refetchInterval: 30000, // 30 seconds
    staleTime: 60000, // 1 minute
    // Enable background refetch for live updates
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  // Set up real-time subscriptions for automatic updates
  useEffect(() => {
    if (!user && !employeeId) return;

    const id = employeeId || user?.id;
    
    // Subscribe to employee table changes
    const employeeChannel = supabase
      .channel(`employee-leave-updates-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'employees',
          filter: employeeId ? `id=eq.${employeeId}` : `user_id=eq.${id}`
        },
        (payload) => {
          console.log('Employee leave data updated via real-time:', payload);
          query.refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leave_calendar',
          filter: employeeId ? `employee_id=eq.${employeeId}` : `employee_id=eq.${id}`
        },
        (payload) => {
          console.log('Leave calendar updated via real-time:', payload);
          query.refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payroll',
          filter: employeeId ? `employee_id=eq.${employeeId}` : `employee_id=eq.${id}`
        },
        (payload) => {
          console.log('Payroll data updated, refreshing leave data:', payload);
          query.refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(employeeChannel);
    };
  }, [user, employeeId, query]);

  return query;
}
