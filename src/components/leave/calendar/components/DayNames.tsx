
import React from 'react';

const DayNames = () => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <div className="grid grid-cols-7 gap-1 mb-2">
      {days.map((day) => (
        <div 
          key={day} 
          className="text-center text-sm font-medium text-gray-500 py-1"
        >
          {day}
        </div>
      ))}
    </div>
  );
};

export default DayNames;
