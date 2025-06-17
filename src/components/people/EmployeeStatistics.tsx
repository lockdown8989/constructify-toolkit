
import React, { useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useAttendanceSync } from '@/hooks/use-attendance-sync';
import { useEmployeeLeave, useSyncLeaveData, LeaveData } from '@/hooks/use-employee-leave';
import { useQueryClient } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';

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
  useAttendanceSync(); 
  
  const { data: leaveData, isLoading, refetch } = useEmployeeLeave(employeeId);
  const syncLeaveData = useSyncLeaveData();
  
  // Force refresh data on component mount
  useEffect(() => {
    refetch();
    
    const refreshInterval = setInterval(() => {
      refetch();
    }, 60000);
    
    const handleSync = () => {
      console.log('Leave data sync triggered, refreshing data...');
      refetch();
      queryClient.invalidateQueries({ queryKey: ['employee-leave'] });
    };
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, [refetch, queryClient]);
  
  // Use provided props if available, otherwise use data from the hook
  const annualLeave = annual_leave_days ?? leaveData?.annual_leave_days ?? 0;
  const sickLeave = sick_leave_days ?? leaveData?.sick_leave_days ?? 0;
  const totalAnnual = totalAnnualLeave ?? leaveData?.totalAnnualLeave ?? 30;
  const totalSick = totalSickLeave ?? leaveData?.totalSickLeave ?? 15;

  // Calculate percentages and apply clamping for safety
  const annualLeavePercentage = Math.min(Math.max((annualLeave / totalAnnual) * 100, 0), 100);
  const sickLeavePercentage = Math.min(Math.max((sickLeave / totalSick) * 100, 0), 100);
  
  const getAnnualLeaveColor = () => {
    if (annualLeavePercentage < 25) return "bg-red-500";
    if (annualLeavePercentage < 50) return "bg-orange-500";
    return "bg-amber-400";
  };

  const handleSyncData = () => {
    if (employeeId) {
      syncLeaveData.mutate(employeeId);
    }
  };
  
  if (isLoading) {
    return <div className="p-4 text-center">Loading leave statistics...</div>;
  }
  
  return (
    <div className="space-y-6">
      {/* Sync Button for Managers */}
      {employeeId && (
        <div className="flex justify-end">
          <Button
            onClick={handleSyncData}
            variant="outline"
            size="sm"
            disabled={syncLeaveData.isPending}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${syncLeaveData.isPending ? 'animate-spin' : ''}`} />
            Sync Leave Data
          </Button>
        </div>
      )}

      <div className="bg-apple-gray-50 p-4 rounded-xl">
        <div className="flex justify-between mb-2">
          <p className="text-base sm:text-lg font-semibold text-apple-gray-900">Holiday left:</p>
          <p className="text-base sm:text-lg font-semibold text-apple-gray-900">
            {annualLeave} <span className="text-sm text-apple-gray-500">/ {totalAnnual} days</span>
          </p>
        </div>
        <Progress 
          value={annualLeavePercentage} 
          className="h-3 sm:h-4 bg-apple-gray-200 rounded-full overflow-hidden" 
          indicatorClassName={`${getAnnualLeaveColor()} transition-all duration-500`} 
        />
        {leaveData?.annualLeaveUsed !== undefined && (
          <div className="text-sm text-apple-gray-500 mt-1">
            Used: {leaveData.annualLeaveUsed} days this year
          </div>
        )}
      </div>
      
      <div className="bg-apple-gray-50 p-4 rounded-xl">
        <div className="flex justify-between mb-2">
          <p className="text-base sm:text-lg font-semibold text-apple-gray-900">Sickness:</p>
          <p className="text-base sm:text-lg font-semibold text-apple-gray-900">
            {sickLeave} <span className="text-sm text-apple-gray-500">/ {totalSick} days</span>
          </p>
        </div>
        <Progress 
          value={sickLeavePercentage} 
          className="h-3 sm:h-4 bg-apple-gray-200 rounded-full overflow-hidden" 
          indicatorClassName="bg-black transition-all duration-500" 
        />
        {leaveData?.sickLeaveUsed !== undefined && (
          <div className="text-sm text-apple-gray-500 mt-1">
            Used: {leaveData.sickLeaveUsed} days this year
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeStatistics;
