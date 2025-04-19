
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WeekSummaryColumnProps {
  totalHours: number;
  totalCost: number;
  formatCurrency: (value: number) => string;
  openShiftsCount: number;
  openShiftsHours: number;
  previousWeek?: () => void;
  nextWeek?: () => void;
}

const WeekSummaryColumn: React.FC<WeekSummaryColumnProps> = ({ 
  totalHours, 
  totalCost,
  formatCurrency,
  openShiftsCount,
  openShiftsHours,
  previousWeek,
  nextWeek
}: WeekSummaryColumnProps) => {
  return (
    <div className="col-span-1 border-r border-gray-200">
      <div className="p-3 sm:p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center">
          <span className="font-medium text-gray-800">Summary</span>
        </div>
        
        {(previousWeek || nextWeek) && (
          <div className="flex space-x-1">
            {previousWeek && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={previousWeek} 
                className="h-7 w-7 p-0 rounded-full text-gray-600"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            
            {nextWeek && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={nextWeek} 
                className="h-7 w-7 p-0 rounded-full text-gray-600"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
      
      <div className="p-3 sm:p-4 border-b border-gray-200">
        <div className="flex flex-col space-y-1">
          <div className="text-gray-700 text-sm">Hours</div>
          <div className="text-gray-900 font-semibold">{totalHours.toFixed(0)}h</div>
          <div className="text-gray-700 text-sm mt-2">Cost</div>
          <div className="text-gray-900 font-semibold">{formatCurrency(totalCost)}</div>
        </div>
      </div>
      
      <div className="p-2 flex flex-col gap-2">
        <div className="flex flex-col p-2 border border-dashed border-blue-200 rounded-lg bg-blue-50/30">
          <div className="text-sm text-blue-600 font-medium">Open shifts</div>
          <div className="text-sm">{openShiftsCount} shifts</div>
          <div className="text-sm">{openShiftsHours.toFixed(1)}h</div>
        </div>
      </div>
    </div>
  );
};

export default WeekSummaryColumn;
