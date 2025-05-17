import React, { useMemo } from 'react';

interface TimeSlotsProps {
  timeSlots?: React.ReactNode[];
  currentTimeTop?: number;
  isToday?: boolean;
}

const TimeSlots: React.FC<TimeSlotsProps> = ({ 
  timeSlots: propTimeSlots,
  currentTimeTop,
  isToday
}) => {
  const timeSlots = useMemo(() => {
    // If time slots are provided as props, use them
    if (propTimeSlots) {
      return propTimeSlots;
    }
    
    // Otherwise, generate default time slots
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      const formattedHour = hour > 12 ? `${hour - 12}:00 ${hour >= 12 ? 'PM' : 'AM'}` : `${hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
      slots.push(
        <div key={hour} className="flex border-t border-gray-200/70">
          <div className="w-16 pr-2 py-2 text-right text-xs text-gray-500 font-medium">
            {formattedHour}
          </div>
          <div className="flex-grow min-h-[60px] relative" />
        </div>
      );
    }
    return slots;
  }, [propTimeSlots]);
  
  return (
    <div className="relative">
      {timeSlots}
      
      {/* Current time indicator */}
      {isToday && typeof currentTimeTop === 'number' && (
        <div 
          className="absolute left-0 right-0 h-0.5 bg-red-500 z-10"
          style={{ top: `${currentTimeTop}px` }}
        >
          <div className="absolute -left-1 -top-1.5 h-3 w-3 rounded-full bg-red-500" />
        </div>
      )}
    </div>
  );
};

export default TimeSlots;
