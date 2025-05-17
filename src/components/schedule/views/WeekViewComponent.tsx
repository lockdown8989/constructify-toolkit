
import React from 'react';
import { format, startOfWeek, addDays } from 'date-fns';
import { Schedule } from '@/hooks/use-schedules';

interface WeekViewProps {
  currentDate: Date;
  schedules: Schedule[];
  getEventColor: (index: number) => string;
}

const WeekViewComponent: React.FC<WeekViewProps> = ({
  currentDate,
  schedules,
  getEventColor
}) => {
  // Generate days of the week based on current date
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    return addDays(startOfWeek(currentDate, { weekStartsOn: 0 }), i);
  });

  return (
    <div className="grid grid-cols-7 gap-2 h-96 overflow-auto">
      {weekDays.map((day, dayIndex) => {
        // Filter schedules for the current day
        const daySchedules = schedules.filter(schedule => {
          const scheduleDate = new Date(schedule.start_time);
          return (
            scheduleDate.getDate() === day.getDate() &&
            scheduleDate.getMonth() === day.getMonth() &&
            scheduleDate.getFullYear() === day.getFullYear()
          );
        });

        return (
          <div 
            key={dayIndex} 
            className="border rounded-md bg-white p-2 overflow-hidden flex flex-col"
          >
            <div className="text-center py-1 font-medium text-sm">
              {format(day, 'EEE')}
              <div className="text-xs text-gray-500">{format(day, 'MMM d')}</div>
            </div>
            
            <div className="flex-1 overflow-auto space-y-1">
              {daySchedules.map((schedule, index) => (
                <div 
                  key={schedule.id}
                  className={`p-1 rounded ${getEventColor(index)} text-xs mb-1 overflow-hidden`}
                >
                  <div className="font-medium truncate">{schedule.title}</div>
                  <div className="text-xs opacity-80">
                    {format(new Date(schedule.start_time), 'h:mm a')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WeekViewComponent;
