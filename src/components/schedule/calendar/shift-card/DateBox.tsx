
import React from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface DateBoxProps {
  startTime: Date;
  status: string;
}

export const DateBox: React.FC<DateBoxProps> = ({ startTime, status }) => {
  return (
    <div className={cn(
      "w-14 h-14 rounded-lg flex flex-col items-center justify-center",
      status === 'confirmed' ? "bg-green-100 text-green-700" :
      status === 'pending' ? "bg-orange-100 text-orange-700" :
      "bg-gray-100 text-gray-700"
    )}>
      <span className="text-xs font-medium">
        {format(startTime, 'MMM').toUpperCase()}
      </span>
      <span className="text-lg font-bold">
        {format(startTime, 'd')}
      </span>
    </div>
  );
};
