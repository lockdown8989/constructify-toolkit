
import React from 'react';
import { format } from 'date-fns';
import { MessageSquare, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmployeeShiftProps {
  shift: {
    id: string;
    title?: string;
    start_time: string;
    end_time: string;
    status?: string;
  };
  colorClass: string;
  onClick?: () => void;
}

const EmployeeShift: React.FC<EmployeeShiftProps> = ({ shift, colorClass, onClick }) => {
  const startTime = format(new Date(shift.start_time), 'HH:mm');
  const endTime = format(new Date(shift.end_time), 'HH:mm');
  const title = shift.title?.split(' - ').pop() || 'Shift';
  const isConfirmed = shift.status === 'confirmed' || !shift.status;
  
  return (
    <div 
      className={cn(
        "p-2 rounded-md cursor-pointer transition-all active-touch-state",
        colorClass
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="font-medium text-sm flex items-center">
          {startTime} - {endTime}
          {isConfirmed && <Check className="ml-1 h-3.5 w-3.5 text-green-600" />}
        </div>
        <MessageSquare className="h-3.5 w-3.5 text-gray-500" />
      </div>
      <div className="text-xs text-gray-700">{title}</div>
    </div>
  );
};

export default EmployeeShift;
