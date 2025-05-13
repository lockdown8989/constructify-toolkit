
import React from 'react';

const DayNames: React.FC = () => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <>
      {days.map((day) => (
        <div 
          key={day} 
          className="h-8 flex items-center justify-center font-medium text-sm text-gray-600"
        >
          {day}
        </div>
      ))}
    </>
  );
};

export default DayNames;
