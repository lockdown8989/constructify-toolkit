
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { useEmployeeLeave } from '@/hooks/use-employee-leave';

interface StatisticsProps {
  holidayLeft?: number;
  sickness?: number;
  employeeId?: string;
}

const EmployeeStatistics: React.FC<StatisticsProps> = ({ 
  holidayLeft, 
  sickness,
  employeeId
}) => {
  // If props aren't provided directly, fetch from the database
  const { data: leaveData, isLoading } = useEmployeeLeave(employeeId);
  
  // Use provided props if available, otherwise use data from hook
  const annualLeave = holidayLeft ?? leaveData?.annual_leave_days ?? 0;
  const sickLeave = sickness ?? leaveData?.sick_leave_days ?? 0;
  const totalAnnual = leaveData?.totalAnnualLeave ?? 30;
  const totalSick = leaveData?.totalSickLeave ?? 15;

  // Calculate percentages
  const annualLeavePercentage = (annualLeave / totalAnnual) * 100;
  const sickLeavePercentage = (sickLeave / totalSick) * 100;
  
  if (isLoading) {
    return <div className="p-2 text-center text-sm">Loading statistics...</div>;
  }
  
  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm">Holiday left</span>
          <span className="text-sm font-medium">{annualLeave} days</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full">
          <div 
            className="h-full bg-amber-400 rounded-full" 
            style={{ width: `${annualLeavePercentage}%` }}
          />
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm">Sickness</span>
          <span className="text-sm font-medium">{sickLeave} days</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full">
          <div 
            className="h-full bg-gray-800 rounded-full" 
            style={{ width: `${sickLeavePercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default EmployeeStatistics;
