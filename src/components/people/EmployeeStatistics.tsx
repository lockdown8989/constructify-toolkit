
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
  return (
    <div className="space-y-8">
      <div>
        <div className="flex justify-between mb-2">
          <p className="text-xl font-semibold text-apple-gray-900">Holiday left:</p>
          <p className="text-xl font-semibold text-apple-gray-900">{annual_leave_days} days</p>
        </div>
        <Progress 
          value={(annual_leave_days / totalAnnualLeave) * 100} 
          className="h-4 bg-apple-gray-200" 
          indicatorClassName="bg-amber-400" 
        />
      </div>
      
      <div>
        <div className="flex justify-between mb-2">
          <p className="text-xl font-semibold text-apple-gray-900">Sickness:</p>
          <p className="text-xl font-semibold text-apple-gray-900">{sick_leave_days} days</p>
        </div>
        <Progress 
          value={(sick_leave_days / totalSickLeave) * 100} 
          className="h-4 bg-apple-gray-200" 
          indicatorClassName="bg-black" 
        />
      </div>
    </div>
  );
};

export default EmployeeStatistics;
