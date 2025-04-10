
import React from "react";

const CalendarDayNames: React.FC = () => {
  return (
    <>
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
        <div key={day} className="text-center font-medium py-2 text-sm">
          {day}
        </div>
      ))}
    </>
  );
};

export default CalendarDayNames;
