
import React, { useState, useEffect } from 'react';
import { format, isToday } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { Clock, Bell } from 'lucide-react';
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
  
  // Track new schedules with a visual indicator
  const [newSchedules, setNewSchedules] = useState<Record<string, boolean>>({});
  
  // This effect would ideally check against a last-seen timestamp in localStorage
  // or a user preferences setting. For now, we'll just mark all schedules as "new"
  // if they were created in the last 24 hours
  useEffect(() => {
    const now = new Date();
    const newScheduleIds: Record<string, boolean> = {};
    
    daySchedules.forEach(schedule => {
      const createdAt = new Date(schedule.created_at || schedule.start_time);
      const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceCreation < 24) {
        newScheduleIds[schedule.id] = true;
      }
    });
    
    setNewSchedules(newScheduleIds);
  }, [daySchedules]);
  
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <TimeSlots 
        timeSlots={timeSlots} 
        currentTimeTop={currentTimeTop} 
        isToday={isToday(currentDate)} 
      />
          
      {daySchedules.map((schedule, index) => {
        const { top, height } = getEventPosition(schedule);
        const isNewSchedule = newSchedules[schedule.id];
        
        return (
          <div
            key={schedule.id}
            className={cn(
              "absolute left-16 right-4 border-l-4 rounded-xl p-2 overflow-hidden shadow-sm transition-all duration-150",
              getEventColor(index)
            )}
            style={{ top: `${top}px`, height: `${height}px` }}
          >
            <div className="font-medium text-sm flex items-center">
              {schedule.title}
              {isNewSchedule && (
                <Bell className="h-3.5 w-3.5 ml-1.5 text-blue-500 animate-pulse" />
              )}
            </div>
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
