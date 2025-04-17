
import React from 'react';

interface TimeSlotsProps {
  timeSlots: React.ReactNode[];
  currentTimeTop: number;
  isToday: boolean;
}

const TimeSlots = ({ timeSlots, currentTimeTop, isToday }: TimeSlotsProps) => {
  return (
    <div className="relative mt-4 border border-gray-100 rounded-xl overflow-hidden bg-white">
      {timeSlots}
      
      {/* Current time indicator */}
      {isToday && currentTimeTop >= 0 && (
        <div 
          className="absolute left-0 right-0 flex items-center pointer-events-none z-10" 
          style={{ top: `${currentTimeTop}px` }}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 ml-14 mr-1"></div>
          <div className="flex-1 h-[2px] bg-red-500"></div>
        </div>
      )}
    </div>
  );
};

export default TimeSlots;
