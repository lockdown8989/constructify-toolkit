
import React from 'react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DayNames: React.FC = () => {
  return (
    <div className="grid grid-cols-7 gap-1 text-center">
      {DAYS.map((day) => (
        <div key={day} className="py-2 font-medium text-sm text-gray-600">
          {day}
        </div>
      ))}
    </div>
  );
};

export default DayNames;
