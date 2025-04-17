
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DayStats, OpenShift } from '@/types/restaurant-schedule';
import OpenShiftBlock from './OpenShiftBlock';

interface DayColumnProps {
  day: DayStats;
  index: number;
  dayDisplayName: string;
  formatCurrency: (amount: number, currency?: string, locale?: string) => string;
  openShifts: OpenShift[];
  onAssign: (openShiftId: string, employeeId?: string) => void;
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
  // Handler for when there's no open shifts to drop on
  const handleColumnDragOver = (e: React.DragEvent) => {
    if (openShifts.filter(s => s.day === day.day).length === 0) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'none'; // Indicate that dropping is not allowed
    }
  };
  
  const dayShifts = openShifts.filter(s => s.day === day.day);
  
  return (
    <div 
      className="col-span-1 border-r border-gray-200"
      onDragOver={handleColumnDragOver}
    >
      <div className="p-3 sm:p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/80">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-gray-900">{dayDisplayName}</span>
        </div>
        <div className="flex space-x-1">
          {index === 0 && previousWeek && (
            <Button variant="ghost" size="icon" onClick={previousWeek} className="h-7 w-7 rounded-full hover:bg-gray-100">
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            </Button>
          )}
          {index === 1 && nextWeek && (
            <Button variant="ghost" size="icon" onClick={nextWeek} className="h-7 w-7 rounded-full hover:bg-gray-100">
              <ChevronRight className="h-4 w-4 text-gray-600" />
            </Button>
          )}
        </div>
      </div>
      
      <div className="p-3 sm:p-4 border-b border-gray-200 bg-white/50">
        <div className="flex justify-between items-center">
          <div className="flex flex-col space-y-1">
            <div className="text-gray-900 font-medium">{day.totalHours.toFixed(1)}h</div>
            <div className="text-gray-900 font-medium">{formatCurrency(day.totalCost)}</div>
          </div>
        </div>
      </div>
      
      <div className="p-2">
        {dayShifts.length > 0 ? (
          dayShifts.map(openShift => (
            <OpenShiftBlock
              key={openShift.id}
              openShift={openShift}
              color={openShift.role.includes('Waiting') ? 'yellow' : 'blue'}
              onAssign={onAssign}
            />
          ))
        ) : (
          <div className="py-6 text-center text-gray-400 text-sm">
            <div className="rotate-45 transform inline-block mb-1 opacity-50">+</div>
            <div>No shifts</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DayColumn;
