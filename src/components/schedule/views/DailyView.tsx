
import React from 'react';
import { format, addHours, setHours, setMinutes } from 'date-fns';
import { Schedule } from '@/hooks/use-schedules';
import { cn } from '@/lib/utils';

interface DailyViewProps {
  date: Date;
  schedules: Schedule[];
  onShiftClick: (shift: any) => void;
}

const DailyView: React.FC<DailyViewProps> = ({ date, schedules, onShiftClick }) => {
  // Generate time slots for the day (hourly from 6am to 10pm)
  const timeSlots = Array.from({ length: 17 }, (_, i) => {
    const hour = i + 6; // Starting from 6 AM
    return setHours(setMinutes(date, 0), hour);
  });

  // Filter schedules for the selected date
  const daySchedules = schedules.filter(schedule => {
    const scheduleDate = new Date(schedule.start_time);
    return scheduleDate.getDate() === date.getDate() &&
      scheduleDate.getMonth() === date.getMonth() &&
      scheduleDate.getFullYear() === date.getFullYear();
  });
  
  // Calculate position and height for event display
  const getEventStyle = (start: Date, end: Date) => {
    const startHour = start.getHours() + start.getMinutes() / 60;
    const endHour = end.getHours() + end.getMinutes() / 60;
    
    // Calculate position relative to 6am (first slot)
    const top = Math.max(0, (startHour - 6) * 60); // 60px per hour
    const height = Math.max(30, (endHour - startHour) * 60); // Minimum height of 30px
    
    return { top, height };
  };

  // Get the current time for time indicator
  const now = new Date();
  const currentTimeTop = now.getHours() >= 6 && now.getHours() < 23 ? 
    ((now.getHours() - 6) * 60 + now.getMinutes()) : -1;

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="text-center py-3 bg-gray-50 border-b font-medium">
        {format(date, 'EEEE, MMMM d, yyyy')}
      </div>
      
      <div className="relative min-h-[800px] bg-white">
        {/* Time slots */}
        {timeSlots.map((time, index) => (
          <div 
            key={index} 
            className={cn(
              "border-b h-[60px] flex",
              index === 0 && "border-t"
            )}
          >
            <div className="w-16 pr-2 text-right text-xs text-gray-500 py-1 border-r">
              {format(time, 'h a')}
            </div>
            <div className="flex-1 relative">
              {/* Half-hour marker */}
              <div className="absolute left-0 right-0 top-1/2 border-t border-gray-100"></div>
            </div>
          </div>
        ))}
        
        {/* Current time indicator */}
        {currentTimeTop > 0 && (
          <div 
            className="absolute left-0 right-0 border-t border-red-400 z-10 pointer-events-none"
            style={{ top: `${currentTimeTop}px` }}
          >
            <div className="w-2 h-2 rounded-full bg-red-400 absolute -left-1 -top-1"></div>
          </div>
        )}
        
        {/* Events */}
        {daySchedules.map(schedule => {
          const start = new Date(schedule.start_time);
          const end = new Date(schedule.end_time);
          const { top, height } = getEventStyle(start, end);
          
          return (
            <div
              key={schedule.id}
              className={cn(
                "absolute left-16 right-4 rounded px-2 py-1 cursor-pointer overflow-hidden",
                schedule.status === 'pending' ? "bg-amber-100 text-amber-800 border-amber-200" : 
                schedule.status === 'confirmed' ? "bg-green-100 text-green-800 border-green-200" : 
                "bg-blue-100 text-blue-800 border-blue-200",
                "border-l-4"
              )}
              style={{ top: `${top}px`, height: `${height}px` }}
              onClick={() => onShiftClick(schedule)}
            >
              <div className="font-medium text-sm truncate">{schedule.title || 'Untitled Shift'}</div>
              <div className="text-xs opacity-80">
                {format(start, 'h:mm a')} - {format(end, 'h:mm a')}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DailyView;
