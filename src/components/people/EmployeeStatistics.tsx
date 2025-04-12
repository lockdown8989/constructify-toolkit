
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface EmployeeStatisticsProps {
  annual_leave_days?: number;
  sick_leave_days?: number;
  totalAnnualLeave?: number;
  totalSickLeave?: number;
}

const EmployeeStatistics: React.FC<EmployeeStatisticsProps> = ({
  annual_leave_days = 0,
  sick_leave_days = 0,
  totalAnnualLeave = 30,
  totalSickLeave = 15
}) => {
  // Calculate percentages and apply clamping for safety
  const annualLeavePercentage = Math.min(Math.max((annual_leave_days / totalAnnualLeave) * 100, 0), 100);
  const sickLeavePercentage = Math.min(Math.max((sick_leave_days / totalSickLeave) * 100, 0), 100);
  
  // Apply color based on percentage values
  const getAnnualLeaveColor = () => {
    if (annualLeavePercentage < 25) return "bg-red-500";
    if (annualLeavePercentage < 50) return "bg-orange-500";
    return "bg-amber-400";
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-apple-gray-50 p-4 rounded-xl">
        <div className="flex justify-between mb-2">
          <p className="text-base sm:text-lg font-semibold text-apple-gray-900">Holiday left:</p>
          <p className="text-base sm:text-lg font-semibold text-apple-gray-900">
            {annual_leave_days} <span className="text-sm text-apple-gray-500">/ {totalAnnualLeave} days</span>
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
            {sick_leave_days} <span className="text-sm text-apple-gray-500">/ {totalSickLeave} days</span>
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
