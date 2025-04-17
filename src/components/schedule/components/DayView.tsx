
import React from 'react';
import { format, isToday } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import TimeSlots from './TimeSlots';
import { type Schedule } from '@/hooks/use-schedules';

interface DayViewProps {
  currentDate: Date;
  schedules: Schedule[];
  timeSlots: React.ReactNode[];
  currentTimeTop: number;
  getEventPosition: (schedule: Schedule) => { top: number; height: number };
  getEventColor: (index: number) => string;
}

const DayView = ({
  currentDate,
  schedules,
  timeSlots,
  currentTimeTop,
  getEventPosition,
  getEventColor
}: DayViewProps) => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const dateStr = format(currentDate, 'yyyy-MM-dd');
  const daySchedules = schedules.filter(schedule => 
    schedule.start_time.includes(dateStr)
  );
  
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <TimeSlots 
        timeSlots={timeSlots} 
        currentTimeTop={currentTimeTop} 
        isToday={isToday(currentDate)} 
      />
          
      {daySchedules.map((schedule, index) => {
        const { top, height } = getEventPosition(schedule);
        return (
          <div
            key={schedule.id}
            className={cn(
              "absolute left-16 right-4 border-l-4 rounded-xl p-2 overflow-hidden shadow-sm transition-all duration-150",
              getEventColor(index)
            )}
            style={{ top: `${top}px`, height: `${height}px` }}
          >
            <div className="font-medium text-sm">{schedule.title}</div>
            <div className="text-xs flex items-center text-gray-600">
              <Clock className="h-3 w-3 mr-1 inline" />
              {formatInTimeZone(new Date(schedule.start_time), timeZone, 'h:mm a')} - 
              {formatInTimeZone(new Date(schedule.end_time), timeZone, 'h:mm a')}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DayView;
