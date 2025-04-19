
import React from 'react';
import { CalendarIcon } from 'lucide-react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface CalendarHeaderProps {
  currentDateLabel: string;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({ currentDateLabel }) => {
  return (
    <div className="bg-blue-500 p-4 text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          <h2 className="font-semibold text-lg">MY SCHEDULE</h2>
        </div>
        <div className="text-sm">
          {currentDateLabel}
        </div>
      </div>
    </div>
  );
};
