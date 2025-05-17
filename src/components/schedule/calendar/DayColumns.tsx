
import React from 'react';
import { format, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import ShiftActionsMenu from '../ShiftActionsMenu';

interface DayColumnsProps {
  visibleDays: Date[];
  onAddShift: (date: Date) => void;
  onSwapShift: (date: Date) => void;
  isManager: boolean;
  isAdmin: boolean;
  isHR: boolean;
  onDateClick?: (date: Date) => void;
}

const DayColumns: React.FC<DayColumnsProps> = ({
  visibleDays,
  onAddShift,
  onSwapShift,
  isManager,
  isAdmin,
  isHR,
  onDateClick
}) => {
  const handleDateClick = (day: Date, e: React.MouseEvent) => {
    if (onDateClick && (isManager || isAdmin || isHR)) {
      e.stopPropagation();
      onDateClick(day);
    }
  };

  return (
    <div className="flex border-b border-gray-200">
      <div className="w-[120px] p-2 flex items-center justify-center bg-gray-50 border-r border-gray-200">
        <span className="font-medium text-sm">Employees</span>
      </div>
      
      {visibleDays.map(day => {
        const isCurrentDay = isToday(day);
        return (
          <div 
            key={format(day, 'yyyy-MM-dd')} 
            className={cn(
              "flex-1 p-2 text-center cursor-pointer transition-all",
              isCurrentDay ? 'bg-blue-50 animate-pulse-slow' : ''
            )}
            onClick={(e) => handleDateClick(day, e)}
          >
            <div className="text-xs uppercase text-gray-500">{format(day, 'EEE')}</div>
            <div className={cn(
              "flex items-center justify-center h-6",
              isCurrentDay ? 'font-bold text-blue-600' : ''
            )}>
              {format(day, 'd')}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DayColumns;
