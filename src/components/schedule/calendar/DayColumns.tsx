
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
}

const DayColumns: React.FC<DayColumnsProps> = ({
  visibleDays,
  onAddShift,
  onSwapShift,
  isManager,
  isAdmin,
  isHR
}) => {
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
            className={`flex-1 p-2 text-center ${isCurrentDay ? 'bg-blue-50' : ''}`}
          >
            <div className="text-xs uppercase text-gray-500">{format(day, 'EEE')}</div>
            <ShiftActionsMenu
              date={day}
              onAddShift={onAddShift}
              onSwapShift={onSwapShift}
              triggerClassName="flex items-center justify-center h-6 cursor-pointer"
              disabled={!isManager && !isAdmin && !isHR}
            />
          </div>
        );
      })}
    </div>
  );
};

export default DayColumns;
