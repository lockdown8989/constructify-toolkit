
import React from 'react';
import { format, addDays, isToday, isSameDay } from 'date-fns';
import { Schedule } from '@/hooks/use-schedules';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  // Get start of week (Sunday)
  const getStartOfWeek = (date: Date) => {
    const day = date.getDay();
    return new Date(date.setDate(date.getDate() - day));
  };

  // Function to handle previous/next week navigation
  const handleWeekChange = (increment: boolean) => {
    const daysToAdd = increment ? 7 : -7;
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + daysToAdd);
    onDateChange(newDate);
  };

  // Get array of 7 days for the week
  const getDaysOfWeek = () => {
    const startOfWeek = getStartOfWeek(new Date(currentDate));
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      days.push(addDays(startOfWeek, i));
    }
    
    return days;
  };

  const daysOfWeek = getDaysOfWeek();

  // Get schedules for a specific day
  const getSchedulesForDay = (day: Date) => {
    return schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.start_time);
      return isSameDay(scheduleDate, day);
    });
  };

  return (
    <div className="border rounded-md overflow-hidden">
      {/* Week navigation header */}
      <div className="flex items-center justify-between p-3 bg-gray-50 border-b">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleWeekChange(false)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="font-medium">
          {format(daysOfWeek[0], 'MMM d')} - {format(daysOfWeek[6], 'MMM d, yyyy')}
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleWeekChange(true)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Days of week */}
      <div className="grid grid-cols-7">
        {daysOfWeek.map((day, index) => (
          <div 
            key={index} 
            className={`p-2 text-center border-b ${isToday(day) ? 'bg-blue-50' : ''}`}
          >
            <div className="text-xs text-gray-500">{format(day, 'EEE')}</div>
            <div className={`text-sm font-medium ${isToday(day) ? 'text-blue-600' : ''}`}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>
      
      {/* Schedules for each day */}
      <div className="grid grid-cols-7">
        {daysOfWeek.map((day, dayIndex) => {
          const daySchedules = getSchedulesForDay(day);
          return (
            <div 
              key={dayIndex} 
              className={`p-1 min-h-[80px] border-r border-b ${dayIndex === 6 ? 'border-r-0' : ''} ${isToday(day) ? 'bg-blue-50/30' : ''}`}
            >
              {daySchedules.length > 0 ? (
                <div className="space-y-1">
                  {daySchedules.map((schedule) => (
                    <div 
                      key={schedule.id}
                      className="bg-blue-100 border-l-2 border-blue-500 p-1 rounded-sm text-xs"
                    >
                      <div className="font-medium truncate">{schedule.title}</div>
                      <div className="text-gray-600">
                        {format(new Date(schedule.start_time), 'h:mm a')} - 
                        {format(new Date(schedule.end_time), 'h:mm a')}
                      </div>
                      {/* Removed the department reference that caused the error */}
                      <div className="text-gray-500">{schedule.location || 'No location'}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-gray-400">
                  No shifts
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyCalendarView;
