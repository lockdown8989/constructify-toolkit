
import React from "react";

const CalendarLegend: React.FC = () => {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
        <span className="text-xs">Holiday</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded-full bg-red-500"></div>
        <span className="text-xs">Sickness</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
        <span className="text-xs">Personal</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
        <span className="text-xs">Parental</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded-full bg-gray-500"></div>
        <span className="text-xs">Other</span>
      </div>
    </div>
  );
};

export default CalendarLegend;
