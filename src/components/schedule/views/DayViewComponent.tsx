
import React from 'react';
import { format } from 'date-fns';
import { Schedule } from '@/hooks/use-schedules';
import TimeSlots from '../components/TimeSlots';
import TimeIndicator from '../components/TimeIndicator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getInitials } from '@/lib/utils';

interface DayViewProps {
  currentDate: Date;
  schedules: Schedule[];
  currentTimeTop: number;
  getEventPosition: (schedule: Schedule) => { top: number; height: number };
  getEventColor: (index: number) => string;
}

interface ShiftEmployeeProps {
  employeeId: string | null | undefined;
}

const ShiftEmployee: React.FC<ShiftEmployeeProps> = ({ employeeId }) => {
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

  return (
    <Avatar className="h-8 w-8 border-2 border-white">
      <AvatarImage src={employee.avatar} alt={employee.name} />
      <AvatarFallback>{getInitials(employee.name)}</AvatarFallback>
    </Avatar>
  );
};

// Function to group schedules by time blocks
const groupSchedulesByTimeBlocks = (schedules: Schedule[]): Record<string, Schedule[]> => {
  const groupedSchedules: Record<string, Schedule[]> = {};
  
  schedules.forEach(schedule => {
    const startTime = new Date(schedule.start_time);
    const endTime = new Date(schedule.end_time);
    
    const startHour = startTime.getHours();
    const endHour = endTime.getHours();
    
    const timeBlock = `${startHour}:${startTime.getMinutes() || '00'}-${endHour}:${endTime.getMinutes() || '00'}`;
    
    if (!groupedSchedules[timeBlock]) {
      groupedSchedules[timeBlock] = [];
    }
    
    groupedSchedules[timeBlock].push(schedule);
  });
  
  return groupedSchedules;
};

const DayViewComponent: React.FC<DayViewProps> = ({
  currentDate,
  schedules,
  currentTimeTop,
  getEventPosition,
  getEventColor
}) => {
  // Filter schedules for the current day
  const filteredSchedules = schedules.filter(schedule => {
    const scheduleDate = new Date(schedule.start_time);
    return (
      scheduleDate.getDate() === currentDate.getDate() &&
      scheduleDate.getMonth() === currentDate.getMonth() &&
      scheduleDate.getFullYear() === currentDate.getFullYear()
    );
  });

  // Group schedules by time blocks
  const groupedSchedules = groupSchedulesByTimeBlocks(filteredSchedules);
  const timeBlocks = Object.keys(groupedSchedules).sort();

  return (
    <div className="border rounded-md overflow-hidden bg-white">
      {/* If we have grouped schedules, show the card view similar to the image */}
      {timeBlocks.length > 0 ? (
        <div className="p-4 space-y-4">
          {timeBlocks.map((timeBlock, index) => {
            const schedules = groupedSchedules[timeBlock];
            const firstSchedule = schedules[0];
            const startTime = new Date(firstSchedule.start_time);
            const endTime = new Date(firstSchedule.end_time);
            
            return (
              <div 
                key={timeBlock}
                className="rounded-xl overflow-hidden shadow-sm bg-cyan-500 text-white"
              >
                <div className="p-4">
                  <div className="text-2xl font-bold">
                    {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
                  </div>
                  <div className="text-xl mt-1">{firstSchedule.title}</div>
                  
                  {/* Show employees assigned to this shift */}
                  <div className="mt-4 flex -space-x-2">
                    {schedules.map(schedule => (
                      <ShiftEmployee key={schedule.id} employeeId={schedule.employee_id} />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Traditional timeline view if no grouped schedules
        <div className="relative">
          <TimeSlots />
          
          {/* Current time indicator */}
          {currentTimeTop > 0 && (
            <TimeIndicator />
          )}
          
          {/* Render events */}
          <div className="absolute top-0 left-16 right-0 h-full">
            {filteredSchedules.map((schedule, index) => {
              const { top, height } = getEventPosition(schedule);
              return (
                <div
                  key={schedule.id}
                  className={`absolute left-0 right-4 rounded px-2 py-1 ${getEventColor(index)}`}
                  style={{ top: `${top}px`, height: `${height}px` }}
                >
                  <div className="font-medium text-sm truncate">{schedule.title}</div>
                  <div className="text-xs opacity-80">
                    {format(new Date(schedule.start_time), 'h:mm a')} - {format(new Date(schedule.end_time), 'h:mm a')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DayViewComponent;
