
import React from 'react';

/**
 * Day names component for calendar displays
 * Displays the days of the week as column headers
 */
const DayNames: React.FC = () => {
  // Array of day names
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <div className="grid grid-cols-7 gap-1 mb-2">
      {dayNames.map((day, index) => (
        <div 
          key={index} 
          className="text-center py-2 font-medium text-sm text-gray-700"
        >
          {day}
        </div>
      ))}
    </div>
  );
};

export default DayNames;
