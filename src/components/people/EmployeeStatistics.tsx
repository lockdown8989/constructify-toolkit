
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { useAttendanceSync } from '@/hooks/use-attendance-sync';
import { useEmployeeLeave, LeaveData } from '@/hooks/use-employee-leave';

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
  useAttendanceSync(); // Enable real-time sync
  
  // If direct props aren't provided, fetch from the database
  const { data: leaveData, isLoading } = useEmployeeLeave(employeeId);
  
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
    return <div className="p-4 text-center">Loading leave statistics...</div>;
  }
  
  return (
    <div className="space-y-6">
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
      </div>
    </div>
  );
};

export default EmployeeStatistics;
