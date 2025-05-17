
import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { Schedule } from '@/hooks/use-schedules';
import { useNavigate } from 'react-router-dom';

interface MonthlyViewProps {
  currentDate: Date;
  schedules: Schedule[];
  onDateClick?: (date: Date) => void;
}

const MonthlyView: React.FC<MonthlyViewProps> = ({
  currentDate,
  schedules,
  onDateClick,
}) => {
  const navigate = useNavigate();
  
  // Generate all days of the current month
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Function to get schedules for a specific day
  const getSchedulesForDay = (date: Date) => {
    return schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.start_time);
      return scheduleDate.getDate() === date.getDate() &&
        scheduleDate.getMonth() === date.getMonth() &&
        scheduleDate.getFullYear() === date.getFullYear();
    });
  };

  // Handle date cell click
  const handleDateClick = (date: Date) => {
    if (onDateClick) {
      onDateClick(date);
    } else {
      // Navigate to daily view for this date
      navigate('/shift-calendar', { state: { selectedDate: date, view: 'day' } });
    }
  };

  // Get days of week headers
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Create weeks array for grid
  const weeks: Date[][] = [];
  let days: Date[] = [];
  
  // Get the start day offset (0 = Sunday, 6 = Saturday)
  const startDayOffset = monthStart.getDay();
  
  // Add days from previous month to align grid
  for (let i = 0; i < startDayOffset; i++) {
    days.push(new Date(monthStart));
  }
  
  // Add all days of current month
  daysInMonth.forEach(day => {
    days.push(day);
    if (days.length === 7) {
      weeks.push(days);
      days = [];
    }
  });
  
  // Add remaining days to complete the last week
  if (days.length > 0) {
    while (days.length < 7) {
      days.push(new Date(monthEnd));
    }
    weeks.push(days);
  }

  return (
    <div className="border rounded-md overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-7 bg-gray-50">
        {dayNames.map((day, index) => (
          <div key={index} className="py-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="bg-white">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 border-t">
            {week.map((day, dayIndex) => {
              const daySchedules = getSchedulesForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isCurrentDay = isToday(day);
              const hasEvents = daySchedules.length > 0;
              
              return (
                <div
                  key={dayIndex}
                  className={cn(
                    "min-h-24 p-1 border-r relative",
                    isCurrentMonth ? "bg-white" : "bg-gray-50 text-gray-400",
                    isCurrentDay && "bg-blue-50",
                    dayIndex === 6 && "border-r-0"
                  )}
                  onClick={() => handleDateClick(day)}
                >
                  <div className="flex justify-between items-start">
                    <span 
                      className={cn(
                        "inline-flex h-6 w-6 items-center justify-center rounded-full text-sm",
                        isCurrentDay && "bg-blue-500 text-white"
                      )}
                    >
                      {format(day, 'd')}
                    </span>
                  </div>
                  
                  {/* Schedule indicators */}
                  {hasEvents && (
                    <div className="mt-1 space-y-1 max-h-20 overflow-y-auto">
                      {daySchedules.slice(0, 3).map((schedule, idx) => (
                        <div 
                          key={schedule.id}
                          className={cn(
                            "text-xs px-1 py-0.5 rounded truncate",
                            schedule.status === 'pending' ? "bg-amber-100 text-amber-800" : 
                            schedule.status === 'confirmed' ? "bg-green-100 text-green-800" : 
                            "bg-blue-100 text-blue-800"
                          )}
                        >
                          {format(new Date(schedule.start_time), 'h:mm a')}
                        </div>
                      ))}
                      
                      {/* Show count if more than 3 events */}
                      {daySchedules.length > 3 && (
                        <div className="text-xs text-gray-500 px-1">
                          +{daySchedules.length - 3} more
                        </div>
                      )}
                    </div>
                  )}
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
