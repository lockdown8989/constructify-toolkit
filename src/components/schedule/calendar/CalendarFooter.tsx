
import React from 'react';
import { Info } from 'lucide-react';

const CalendarFooter = () => {
  return (
    <div className="py-2 px-4 text-xs text-gray-500 flex items-center border-t">
      <Info className="h-3 w-3 mr-1.5" />
      <span>Employee Schedule updated automatically. See schedule history for more details.</span>
    </div>
  );
};

export default CalendarFooter;
