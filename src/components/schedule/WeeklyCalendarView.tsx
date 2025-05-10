
import React, { useState, useEffect, useCallback } from 'react';
import { format, addDays, startOfWeek, isSameDay, getDay } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';
import { Schedule } from '@/hooks/use-schedules';
import { cn } from '@/lib/utils';
import WeekNavigation from './components/WeekNavigation';
import { getColorByDepartment } from '@/utils/color-utils';

interface WeeklyCalendarViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  schedules: Schedule[];
}

const WeeklyCalendarView: React.FC<WeeklyCalendarViewProps> = ({
  currentDate,
  onDateChange,
  schedules
}) => {
  const isMobile = useIsMobile();
  const [weekDays, setWeekDays] = useState<Date[]>([]);
  
  // Generate the array of week days based on current date
  useEffect(() => {
    const monday = startOfWeek(currentDate, { weekStartsOn: 1 });
    const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
    setWeekDays(days);
  }, [currentDate]);
  
  // Navigate to previous/next week
  const handlePreviousWeek = useCallback(() => {
    const newDate = addDays(currentDate, -7);
    onDateChange(newDate);
  }, [currentDate, onDateChange]);
  
  const handleNextWeek = useCallback(() => {
    const newDate = addDays(currentDate, 7);
    onDateChange(newDate);
  }, [currentDate, onDateChange]);
  
  const handleSelectToday = useCallback(() => {
    onDateChange(new Date());
  }, [onDateChange]);
  
  // Get schedules for a specific day
  const getSchedulesForDay = useCallback((day: Date) => {
    return schedules.filter(schedule => 
      isSameDay(new Date(schedule.start_time), day)
    );
  }, [schedules]);
  
  // Select a specific date
  const handleDateClick = (day: Date) => {
    onDateChange(day);
  };

  // Find today's index in the week array
  const todayIndex = weekDays.findIndex(day => isSameDay(day, new Date()));
  
  return (
    <div className="px-4 py-2">
      <WeekNavigation 
        currentDate={currentDate}
        onPreviousWeek={handlePreviousWeek}
        onNextWeek={handleNextWeek}
        onSelectToday={handleSelectToday}
        isMobile={isMobile}
      />
      
      <div className={`grid grid-cols-7 gap-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
        {weekDays.map((day, index) => {
          const isToday = isSameDay(day, new Date());
          const isSelected = isSameDay(day, currentDate);
          const daySchedules = getSchedulesForDay(day);
          const dayName = format(day, isMobile ? 'EEE' : 'EEE');
          const dayNum = format(day, 'd');
          
          return (
            <div 
              key={day.toString()}
              onClick={() => handleDateClick(day)}
              className={cn(
                "flex flex-col items-center py-2 rounded-md cursor-pointer transition-colors",
                isToday ? "bg-blue-50" : "hover:bg-gray-50",
                isSelected ? "ring-2 ring-blue-500 ring-opacity-70" : "",
              )}
            >
              <div className={`text-center ${isMobile ? 'mb-1' : 'mb-1.5'}`}>
                <div className={`font-medium ${isToday ? 'text-blue-600' : ''}`}>{dayName}</div>
                <div 
                  className={cn(
                    "w-7 h-7 flex items-center justify-center rounded-full",
                    isToday ? "bg-blue-600 text-white" : ""
                  )}
                >
                  {dayNum}
                </div>
              </div>
              
              {daySchedules.length > 0 ? (
                <div className="flex flex-col gap-1 w-full px-1">
                  {daySchedules.slice(0, isMobile ? 2 : 3).map((schedule, idx) => (
                    <div 
                      key={schedule.id}
                      className={cn(
                        "text-xs rounded-sm px-1 py-0.5 truncate",
                        getColorByDepartment(schedule.department || "Default")
                      )}
                    >
                      {format(new Date(schedule.start_time), 'HH:mm')}
                    </div>
                  ))}
                  {daySchedules.length > (isMobile ? 2 : 3) && (
                    <div className="text-xs text-center text-blue-600">
                      +{daySchedules.length - (isMobile ? 2 : 3)} more
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-400 text-xs">No shifts</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyCalendarView;
