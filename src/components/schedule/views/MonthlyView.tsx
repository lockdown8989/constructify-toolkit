
import React from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday } from 'date-fns';
import { Schedule } from '@/hooks/use-schedules';
import { cn } from '@/lib/utils';

interface MonthlyViewProps {
  currentDate: Date;
  schedules: Schedule[];
  onDateClick?: (date: Date) => void;
}

const MonthlyView: React.FC<MonthlyViewProps> = ({ currentDate, schedules, onDateClick }) => {
  // Get month boundaries
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  
  // Get the start and end of the calendar (including days from prev/next months)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start on Monday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  // Create calendar days array
  const calendarDays = [];
  let day = calendarStart;
  
  while (day <= calendarEnd) {
    calendarDays.push(day);
    day = addDays(day, 1);
  }
  
  // Generate weeks
  const weeks = [];
  let week = [];
  
  calendarDays.forEach((day, i) => {
    week.push(day);
    if ((i + 1) % 7 === 0 || i === calendarDays.length - 1) {
      weeks.push(week);
      week = [];
    }
  });
  
  // Get schedules for a specific day
  const getSchedulesForDay = (day: Date) => {
    return schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.start_time);
      return isSameDay(scheduleDate, day);
    });
  };
  
  // Handle date click
  const handleDateClick = (date: Date) => {
    if (onDateClick) {
      onDateClick(date);
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Month header */}
      <div className="p-4 text-center font-semibold text-lg bg-gray-50 border-b">
        {format(currentDate, 'MMMM yyyy')}
      </div>
      
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b bg-gray-50">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
          <div key={i} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="bg-white">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 border-b last:border-b-0">
            {week.map((day, dayIndex) => {
              const daySchedules = getSchedulesForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isDayToday = isToday(day);
              
              return (
                <div
                  key={dayIndex}
                  className={cn(
                    "min-h-[100px] border-r last:border-r-0 p-1 relative cursor-pointer transition-all",
                    !isCurrentMonth && "bg-gray-50",
                    isCurrentMonth && "hover:bg-blue-50/30",
                    isDayToday && "bg-blue-50 animate-pulse-slow"
                  )}
                  onClick={() => handleDateClick(day)}
                >
                  <div className={cn(
                    "text-right p-1 font-medium text-sm",
                    !isCurrentMonth && "text-gray-400",
                    isDayToday && "text-blue-600"
                  )}>
                    {format(day, 'd')}
                  </div>
                  
                  {/* Schedule pills - limited to 3 visible items */}
                  <div className="space-y-1 mt-1">
                    {daySchedules.slice(0, 3).map((schedule, i) => (
                      <div
                        key={i}
                        className={cn(
                          "text-xs p-1 rounded truncate",
                          schedule.status === 'pending' ? "bg-amber-100 text-amber-800" : 
                          schedule.status === 'confirmed' ? "bg-green-100 text-green-800" : 
                          "bg-blue-100 text-blue-800"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle shift click
                        }}
                      >
                        {format(new Date(schedule.start_time), 'h:mm a')} - {schedule.title || 'Shift'}
                      </div>
                    ))}
                    
                    {/* More indicator if there are additional events */}
                    {daySchedules.length > 3 && (
                      <div className="text-xs text-center text-gray-500 font-medium">
                        +{daySchedules.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonthlyView;
