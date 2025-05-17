
import React, { useMemo } from 'react';

const TimeSlots: React.FC = () => {
  const timeSlots = useMemo(() => {
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
  }, []);

  return <>{timeSlots}</>;
};

export default TimeSlots;
