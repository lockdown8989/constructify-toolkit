
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DayStats, OpenShift } from '@/types/restaurant-schedule';
import OpenShiftBlock from './OpenShiftBlock';

interface DayColumnProps {
  day: DayStats;
  index: number;
  dayDisplayName: string;
  formatCurrency: (amount: number) => string;
  openShifts: OpenShift[];
  onAssign: (openShiftId: string) => void;
  previousWeek?: () => void;
  nextWeek?: () => void;
}

const DayColumn = ({ 
  day, 
  index, 
  dayDisplayName, 
  formatCurrency, 
  openShifts, 
  onAssign,
  previousWeek,
  nextWeek
}: DayColumnProps) => {
  return (
    <div className="col-span-1 border-r border-gray-200">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <div className="flex items-center">
          <span className="font-bold text-lg mr-2">{index + 1}</span>
          <span className="text-gray-700">{dayDisplayName}</span>
        </div>
        <div className="flex space-x-2">
          {index === 0 && previousWeek && (
            <Button variant="outline" size="icon" onClick={previousWeek} className="rounded-full h-7 w-7">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          {index === 1 && nextWeek && (
            <Button variant="outline" size="icon" onClick={nextWeek} className="rounded-full h-7 w-7">
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col space-y-1">
          <div className="text-gray-900 font-semibold">{day.totalHours.toFixed(0)}h</div>
          <div className="text-gray-900 font-semibold">{formatCurrency(day.totalCost)}</div>
        </div>
      </div>
      
      <div className="p-2">
        {openShifts
          .filter(s => s.day === day.day)
          .map(openShift => (
            <OpenShiftBlock
              key={openShift.id}
              openShift={openShift}
              color={openShift.role.includes('Waiting') ? 'yellow' : 'blue'}
              onAssign={onAssign}
            />
          ))
        }
      </div>
    </div>
  );
};

export default DayColumn;
