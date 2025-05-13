
import React, { memo } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface EmployeeShiftProps {
  shift: any;
  colorClass: string;
  onClick: () => void;
}

const EmployeeShift: React.FC<EmployeeShiftProps> = ({ 
  shift,
  colorClass,
  onClick
}) => {
  const startTime = new Date(shift.start_time);
  const endTime = new Date(shift.end_time);
  
  return (
    <div 
      className={cn(
        "p-2 rounded text-xs cursor-pointer transition-colors",
        colorClass,
        "hover:opacity-90 active:opacity-80"
      )}
      onClick={onClick}
    >
      <div className="font-medium">
        {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
      </div>
      {shift.location && (
        <div className="text-xs opacity-80 truncate">
          {shift.location}
        </div>
      )}
    </div>
  );
};

// Memoize the component to prevent unnecessary rerenders
export default memo(EmployeeShift);
