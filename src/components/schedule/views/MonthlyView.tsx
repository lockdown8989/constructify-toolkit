
import React from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday } from 'date-fns';
import { Schedule } from '@/hooks/use-schedules';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getInitials } from '@/lib/utils';

interface MonthlyViewProps {
  currentDate: Date;
  schedules: Schedule[];
  onDateClick?: (date: Date) => void;
}

interface ShiftEmployeeProps {
  employeeId: string | null | undefined;
  size?: 'xs' | 'sm' | 'md';
}

const ShiftEmployee: React.FC<ShiftEmployeeProps> = ({ employeeId, size = 'xs' }) => {
  const { data: employee } = useQuery({
    queryKey: ['employee', employeeId],
    queryFn: async () => {
      if (!employeeId) return null;
      const { data } = await supabase
        .from('employees')
        .select('name, avatar')
        .eq('id', employeeId)
        .single();
      return data;
    },
    enabled: !!employeeId,
  });

  if (!employee) return null;

  const sizeClass = {
    xs: 'h-4 w-4',
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
  }[size];

  return (
    <Avatar className={sizeClass}>
      <AvatarImage src={employee.avatar} alt={employee.name} />
      <AvatarFallback className="text-[10px]">{getInitials(employee.name)}</AvatarFallback>
    </Avatar>
  );
};

// Function to group schedules by time blocks for display
const groupSchedulesByTimeBlocks = (daySchedules: Schedule[]): Record<string, Schedule[]> => {
  const groups: Record<string, Schedule[]> = {};
  
  daySchedules.forEach(schedule => {
    const startTime = format(new Date(schedule.start_time), 'HH:mm');
    const endTime = format(new Date(schedule.end_time), 'HH:mm');
    const key = `${startTime}-${endTime}`;
    
    if (!groups[key]) {
      groups[key] = [];
    }
    
    groups[key].push(schedule);
  });
  
  return groups;
};

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
              
              // Group schedules by time blocks for this day
              const groupedSchedules = groupSchedulesByTimeBlocks(daySchedules);
              const timeBlocks = Object.keys(groupedSchedules).slice(0, 3); // Limit to 3 time blocks for display
              
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
                  
                  {/* Schedule blocks - time block style */}
                  <div className="space-y-1 mt-1">
                    {timeBlocks.map((timeBlock, i) => {
                      const blockSchedules = groupedSchedules[timeBlock];
                      const [startTime, endTime] = timeBlock.split('-');
                      
                      return (
                        <div
                          key={timeBlock}
                          className="p-1 rounded-md bg-cyan-500 text-white text-[10px]"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium truncate">
                              {startTime.substring(0, 5)}
                            </span>
                            <div className="flex -space-x-1">
                              {blockSchedules.map((schedule, idx) => (
                                idx < 2 && (
                                  <ShiftEmployee 
                                    key={schedule.id} 
                                    employeeId={schedule.employee_id} 
                                  />
                                )
                              ))}
                              {blockSchedules.length > 2 && (
                                <div className="h-4 w-4 bg-gray-200 rounded-full flex items-center justify-center text-[8px] text-gray-700">
                                  +{blockSchedules.length - 2}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* More indicator if there are additional time blocks */}
                    {Object.keys(groupedSchedules).length > 3 && (
                      <div className="text-[10px] text-center text-gray-500 font-medium">
                        +{Object.keys(groupedSchedules).length - 3} more
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
