
import React from 'react';
import { format } from 'date-fns';
import { Check, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type Schedule } from '@/hooks/use-schedules';

interface EmployeeShiftProps {
  shift: Schedule;
  colorClass: string;
  onClick: () => void;
}

const EmployeeShift: React.FC<EmployeeShiftProps> = ({ shift, colorClass, onClick }) => {
  const startTime = new Date(shift.start_time);
  const endTime = new Date(shift.end_time);
  
  const startFormatted = format(startTime, 'HH:mm');
  const endFormatted = format(endTime, 'HH:mm');
  
  // Extract role from title if formatted as "Name - Role"
  let role = '';
  if (shift.title) {
    const titleParts = shift.title.split(' - ');
    if (titleParts.length > 1) {
      role = titleParts[1];
    } else {
      role = shift.title;
    }
  }
  
  // If no role found, try to use shift type if available
  if (!role && shift.status) {
    role = shift.status;
  }
  
  const isConfirmed = shift.status === 'confirmed';
  
  return (
    <div 
      className={cn(
        "p-2 rounded-md cursor-pointer transition-all",
        colorClass,
        "hover:brightness-95 active:brightness-90"
      )}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div className="font-medium text-gray-700">
          {startFormatted} - {endFormatted}
        </div>
        {isConfirmed && (
          <div className="text-green-600">
            <Check className="h-4 w-4" />
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-center mt-1">
        <div className="text-sm text-gray-600 truncate">
          {role || 'Shift'}
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <MessageSquare className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default EmployeeShift;
