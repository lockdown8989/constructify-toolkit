
import React from 'react';

const DayNames: React.FC = () => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <div className="grid grid-cols-7 gap-1 mb-1">
      {days.map(day => (
        <div key={day} className="text-center text-sm font-medium text-gray-500 py-1">
          {day}
        </div>
      ))}
    </div>
  );
};

export default DayNames;
