
import React, { useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { useAttendanceSync } from '@/hooks/use-attendance-sync';
import { useEmployeeLeave, LeaveData } from '@/hooks/use-employee-leave';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth';

interface EmployeeStatisticsProps {
  annual_leave_days?: number;
  sick_leave_days?: number;
  totalAnnualLeave?: number;
  totalSickLeave?: number;
  employeeId?: string;
}

const EmployeeStatistics: React.FC<EmployeeStatisticsProps> = ({
  annual_leave_days,
  sick_leave_days,
  totalAnnualLeave = 30,
  totalSickLeave = 15,
  employeeId
}) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  // Enable real-time sync
  useAttendanceSync(); 
  
  // If direct props aren't provided, fetch from the database
  const { data: leaveData, isLoading, refetch } = useEmployeeLeave(employeeId);
  
  // Set up real-time synchronization with payroll and manager data
  useEffect(() => {
    if (!employeeId && !user) return;

    const id = employeeId || user?.id;
    
    // Set up real-time subscriptions for live data sync
    const employeeChannel = supabase
      .channel(`employee-stats-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'employees',
          filter: employeeId ? `id=eq.${employeeId}` : `user_id=eq.${id}`
        },
        (payload) => {
          console.log('Employee data changed:', payload);
          refetch();
          queryClient.invalidateQueries({ queryKey: ['employee-leave'] });
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
          console.log('Leave calendar changed:', payload);
          refetch();
          queryClient.invalidateQueries({ queryKey: ['employee-leave'] });
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
          console.log('Payroll data changed:', payload);
          refetch();
          queryClient.invalidateQueries({ queryKey: ['employee-leave'] });
        }
      )
      .subscribe();

    // Initial data refresh
    refetch();
    
    // Set up periodic refresh for live updates
    const refreshInterval = setInterval(() => {
      refetch();
    }, 30000); // Refresh every 30 seconds for live sync
    
    // Clean up subscriptions and interval
    return () => {
      supabase.removeChannel(employeeChannel);
      clearInterval(refreshInterval);
    };
  }, [employeeId, user, refetch, queryClient]);
  
  // Use provided props if available, otherwise use data from the hook
  const annualLeave = annual_leave_days ?? leaveData?.annual_leave_days ?? 0;
  const sickLeave = sick_leave_days ?? leaveData?.sick_leave_days ?? 0;
  const totalAnnual = totalAnnualLeave ?? leaveData?.totalAnnualLeave ?? 30;
  const totalSick = totalSickLeave ?? leaveData?.totalSickLeave ?? 15;

  // Calculate percentages and apply clamping for safety
  const annualLeavePercentage = Math.min(Math.max((annualLeave / totalAnnual) * 100, 0), 100);
  const sickLeavePercentage = Math.min(Math.max((sickLeave / totalSick) * 100, 0), 100);
  
  // Apply color based on percentage values
  const getAnnualLeaveColor = () => {
    if (annualLeavePercentage < 25) return "bg-red-500";
    if (annualLeavePercentage < 50) return "bg-orange-500";
    return "bg-amber-400";
  };
  
  if (isLoading) {
    return (
      <div className="p-2 sm:p-4 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
          <div className="h-3 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Annual Leave */}
      <div className="bg-gray-50 p-3 sm:p-4 rounded-xl">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 space-y-1 sm:space-y-0">
          <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">Holiday left:</p>
          <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">
            {annualLeave} <span className="text-xs sm:text-sm text-gray-500">/ {totalAnnual} days</span>
          </p>
        </div>
        <Progress 
          value={annualLeavePercentage} 
          className="h-2 sm:h-3 lg:h-4 bg-gray-200 rounded-full overflow-hidden" 
          indicatorClassName={`${getAnnualLeaveColor()} transition-all duration-500`} 
        />
        <div className="mt-1 sm:mt-2 text-xs text-gray-500 text-right">
          {annualLeavePercentage.toFixed(1)}% remaining
        </div>
      </div>
      
      {/* Sick Leave */}
      <div className="bg-gray-50 p-3 sm:p-4 rounded-xl">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 space-y-1 sm:space-y-0">
          <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">Sickness:</p>
          <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">
            {sickLeave} <span className="text-xs sm:text-sm text-gray-500">/ {totalSick} days</span>
          </p>
        </div>
        <Progress 
          value={sickLeavePercentage} 
          className="h-2 sm:h-3 lg:h-4 bg-gray-200 rounded-full overflow-hidden" 
          indicatorClassName="bg-black transition-all duration-500" 
        />
        <div className="mt-1 sm:mt-2 text-xs text-gray-500 text-right">
          {sickLeavePercentage.toFixed(1)}% used
        </div>
      </div>
      
      {/* Live sync indicator */}
      <div className="flex items-center justify-center pt-2 sm:pt-3">
        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Live sync active</span>
        </div>
      </div>
    </div>
  );
};

export default EmployeeStatistics;
