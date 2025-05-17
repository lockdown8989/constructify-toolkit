
import React from 'react';
import { format } from 'date-fns';

const CalendarFooter: React.FC = () => {
  return (
    <div className="border-t border-gray-200 p-3 flex justify-between items-center bg-gray-50 text-sm text-gray-500">
      <div>Last updated: {format(new Date(), 'MMM d, yyyy h:mm a')}</div>
      <div>{/* Additional footer content can be added here */}</div>
    </div>
  );
};

export default CalendarFooter;
