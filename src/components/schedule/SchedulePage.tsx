
import React, { useState } from 'react';
import { ScheduleCalendarView } from './enhanced/ScheduleCalendarView';
import { useSchedules } from '@/hooks/use-schedules';
import { useScheduleActions } from '@/hooks/use-schedule-actions';
import { Loader2 } from 'lucide-react';
import { Schedule } from '@/types/schedule.types';
import { cn } from '@/lib/utils';

export const SchedulePage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { data: schedules = [], isLoading } = useSchedules();
  const { handleShiftAction, isLoading: isActionLoading } = useScheduleActions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading schedule...</span>
      </div>
    );
  }

  return (
    <div className={cn(
      "container max-w-7xl mx-auto py-4 px-4",
      "bg-white rounded-xl shadow-sm overflow-hidden"
    )}>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Schedule</h1>
      <ScheduleCalendarView
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        schedules={schedules as Schedule[]}
        onShiftAction={handleShiftAction}
        isLoading={isActionLoading}
      />
    </div>
  );
};
