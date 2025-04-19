
import React from 'react';
import { cn } from '@/lib/utils';

interface TimeSlotsProps {
  timeSlots: React.ReactNode[];
  currentTimeTop: number;
  isToday: boolean;
}

const TimeSlots: React.FC<TimeSlotsProps> = ({ timeSlots, currentTimeTop, isToday }) => {
  return (
    <div className="relative">
      {timeSlots}
      
      {isToday && (
        <div
          className="absolute left-0 right-0 border-t-2 border-red-500 z-10 pointer-events-none"
          style={{ top: `${currentTimeTop}px` }}
        >
          <div className="absolute -left-2 -top-2 w-4 h-4 rounded-full bg-red-500" />
        </div>
      )}
    </div>
  );
};

export default TimeSlots;
