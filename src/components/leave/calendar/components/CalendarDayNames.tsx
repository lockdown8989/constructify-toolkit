
import React from "react";

const CalendarDayNames: React.FC = () => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <>
      {days.map((day) => (
        <div 
          key={day} 
          className="text-center font-medium text-sm py-2 text-gray-600"
        >
          {day}
        </div>
      ))}
    </>
  );
};

export default CalendarDayNames;
