
import React from 'react';

/**
 * Component that displays the names of the days of the week
 */
const DayNames: React.FC = () => {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <div className="grid grid-cols-7 border-b">
      {dayNames.map((day, index) => (
        <div 
          key={index} 
          className="px-2 py-1 text-center text-sm font-medium text-gray-500"
        >
          {day}
        </div>
      ))}
    </div>
  );
};

export default DayNames;
