
import React from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { Schedule } from '@/hooks/use-schedules';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getInitials } from '@/lib/utils';

interface WeekViewProps {
  currentDate: Date;
  schedules: Schedule[];
  getEventColor: (index: number) => string;
}

interface ShiftEmployeeProps {
  employeeId: string | null | undefined;
  size?: 'sm' | 'md';
}

const ShiftEmployee: React.FC<ShiftEmployeeProps> = ({ employeeId, size = 'md' }) => {
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
    <Avatar className={size === 'sm' ? 'h-6 w-6' : 'h-8 w-8'}>
      <AvatarImage src={employee.avatar} alt={employee.name} />
      <AvatarFallback>{getInitials(employee.name)}</AvatarFallback>
    </Avatar>
  );
};

// Function to group schedules by time slots for a day
const groupDaySchedulesByTimeSlots = (daySchedules: Schedule[]): Record<string, Schedule[]> => {
  const grouped: Record<string, Schedule[]> = {};
  
  daySchedules.forEach(schedule => {
    const startTime = new Date(schedule.start_time);
    const endTime = new Date(schedule.end_time);
    
    const timeSlot = `${format(startTime, 'HH:mm')}-${format(endTime, 'HH:mm')}`;
    
    if (!grouped[timeSlot]) {
      grouped[timeSlot] = [];
    }
    
    grouped[timeSlot].push(schedule);
  });
  
  return grouped;
};

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
    <div className="grid grid-cols-7 gap-2 overflow-auto">
      {weekDays.map((day, dayIndex) => {
        // Filter schedules for the current day
        const daySchedules = schedules.filter(schedule => {
          const scheduleDate = new Date(schedule.start_time);
          return isSameDay(scheduleDate, day);
        });

        // Group schedules by time slots
        const groupedSchedules = groupDaySchedulesByTimeSlots(daySchedules);
        const timeSlots = Object.keys(groupedSchedules);

        return (
          <div 
            key={dayIndex} 
            className="border rounded-md bg-white p-2 overflow-hidden flex flex-col"
          >
            <div className="text-center py-1 font-medium text-sm">
              {format(day, 'EEE')}
              <div className="text-xs text-gray-500">{format(day, 'MMM d')}</div>
            </div>
            
            <div className="flex-1 overflow-auto space-y-2">
              {timeSlots.length > 0 ? (
                timeSlots.map(timeSlot => {
                  const slotSchedules = groupedSchedules[timeSlot];
                  const [startTime, endTime] = timeSlot.split('-');
                  
                  return (
                    <div 
                      key={timeSlot}
                      className="bg-cyan-500 text-white p-2 rounded-lg text-xs"
                    >
                      <div className="font-medium">
                        {startTime.replace(':', '')} - {endTime.replace(':', '')}
                      </div>
                      <div className="mt-1 font-bold">{slotSchedules[0].title}</div>
                      
                      {/* Show employee avatars */}
                      <div className="mt-2 flex gap-1">
                        {slotSchedules.map(schedule => (
                          <ShiftEmployee 
                            key={schedule.id} 
                            employeeId={schedule.employee_id}
                            size="sm" 
                          />
                        ))}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-xs text-gray-400 py-2">No shifts</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WeekViewComponent;
