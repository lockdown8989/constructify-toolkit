
import React from 'react';
import { format, isSameDay } from 'date-fns';

interface WeekHeaderProps {
  weekDays: Date[];
}

const WeekHeader: React.FC<WeekHeaderProps> = ({ weekDays }) => {
  return (
    <div className="grid grid-cols-8 border-b">
      <div className="sticky left-0 bg-white z-10 w-16 border-r text-center py-2">
        GMT+07
      </div>
      {weekDays.map((day, index) => (
        <div 
          key={index} 
          className={`text-center py-3 ${isSameDay(day, new Date()) ? 'bg-blue-50' : ''}`}
        >
          <div className="text-gray-500 text-xs uppercase">{format(day, 'EEEE')}</div>
          <div className="text-xl font-semibold">{format(day, 'dd')}</div>
        </div>
      ))}
    </div>
  );
};

export default WeekHeader;
