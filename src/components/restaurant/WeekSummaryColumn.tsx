
import React from 'react';
import { OpenShift, WeekStats } from '@/types/restaurant-schedule';
import OpenShiftBlock from './OpenShiftBlock';

interface WeekSummaryColumnProps {
  weekStats: WeekStats;
  openShifts: OpenShift[];
  formatCurrency: (amount: number) => string;
  handleAssignOpenShift: (openShiftId: string) => void;
}

const WeekSummaryColumn = ({ 
  weekStats, 
  openShifts, 
  formatCurrency, 
  handleAssignOpenShift 
}: WeekSummaryColumnProps) => {
  return (
    <div className="col-span-1 border-r border-gray-200">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="text-sm font-medium text-gray-700">Week {weekStats.weekNumber} summary</div>
      </div>
      
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center">
            <span className="text-gray-600 font-medium mr-2">H</span>
            <span className="text-gray-900 font-semibold">{weekStats.totalHours.toFixed(0)}h</span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-600 font-medium mr-2">C</span>
            <span className="text-gray-900 font-semibold">{formatCurrency(weekStats.totalCost)}</span>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="font-semibold mb-2">Open Shifts</div>
        <div className="text-sm text-gray-600">
          <div>{weekStats.openShiftsTotalHours.toFixed(0)}h 30m</div>
          <div>{weekStats.openShiftsTotalCount} shifts</div>
        </div>
      </div>
    </div>
  );
};

export default WeekSummaryColumn;
