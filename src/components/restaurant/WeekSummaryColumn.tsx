
import React from 'react';
import { WeekStats, OpenShift } from '@/types/restaurant-schedule';

interface WeekSummaryColumnProps {
  weekStats: WeekStats;
  openShifts: OpenShift[];
  formatCurrency: (amount: number, currency?: string, locale?: string) => string;
  handleAssignOpenShift: (openShiftId: string, employeeId?: string) => void;
}

const WeekSummaryColumn = ({ 
  weekStats, 
  openShifts,
  formatCurrency,
  handleAssignOpenShift
}: WeekSummaryColumnProps) => {
  return (
    <div className="col-span-1 border-r border-gray-200">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center">
          <span className="font-medium text-gray-800">Week {weekStats.weekNumber}</span>
        </div>
      </div>
      
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col space-y-1">
          <div className="text-gray-700">Hours</div>
          <div className="text-gray-900 font-semibold">{weekStats.totalHours.toFixed(0)}h</div>
          <div className="text-gray-700 mt-2">Cost</div>
          <div className="text-gray-900 font-semibold">{formatCurrency(weekStats.totalCost)}</div>
        </div>
      </div>
      
      <div className="p-2 flex flex-col gap-2">
        <div className="flex flex-col p-2 border border-dashed border-blue-200 rounded-lg">
          <div className="text-sm text-blue-600 font-medium">Open shifts</div>
          <div className="text-sm">{openShifts.length} shifts</div>
          <div className="text-sm">{weekStats.openShiftsTotalHours.toFixed(1)}h</div>
        </div>
      </div>
    </div>
  );
};

export default WeekSummaryColumn;
