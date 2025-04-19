
import React from 'react';
import { format } from 'date-fns';
import { Bell, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Schedule } from '@/hooks/use-schedules';

interface ScheduleListProps {
  date: Date | undefined;
  schedules: Schedule[];
  schedulesLoading: boolean;
  employeeNames: Record<string, string>;
  newSchedules: Schedule[];
  onAddSchedule: () => void;
  isAdmin: boolean;
  isHR: boolean;
  isMobile: boolean;
}

const ScheduleList = ({
  date,
  schedules,
  schedulesLoading,
  employeeNames,
  newSchedules,
  onAddSchedule,
  isAdmin,
  isHR,
  isMobile
}: ScheduleListProps) => {
  return (
    <div className="mt-4">
      <h3 className="font-medium text-base sm:text-lg mb-2">
        {date ? format(date, 'MMMM d, yyyy') : 'Select a date'}
      </h3>
      {schedulesLoading ? (
        <p className="text-sm">Loading schedules...</p>
      ) : schedules.length > 0 ? (
        <ul className="space-y-2 max-h-[40vh] overflow-y-auto">
          {schedules.map(schedule => {
            // Check if this is a new schedule
            const isNew = newSchedules.some(s => s.id === schedule.id);
            const isPending = schedule.status === 'pending';
            
            return (
              <li key={schedule.id} className="flex items-center py-1 text-sm border-b border-gray-100">
                <span className="w-14 text-xs sm:text-sm text-gray-500">
                  {format(new Date(schedule.start_time), 'h:mm a')}
                </span>
                <span className="flex-1 truncate flex items-center">
                  {schedule.title}
                  {isNew && <Bell className="h-3.5 w-3.5 ml-1.5 text-blue-500 animate-pulse" />}
                  {isPending && <Clock className="h-3.5 w-3.5 ml-1.5 text-amber-500" />}
                </span>
                <span className="text-xs sm:text-sm text-gray-500 truncate max-w-[80px] sm:max-w-none">
                  {employeeNames[schedule.employee_id] || 'Unknown'}
                </span>
                {isPending && (
                  <Badge variant="outline" className="ml-2 text-xs bg-amber-50 text-amber-700 border-amber-300">
                    Pending
                  </Badge>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-gray-500 text-sm">No schedules for this date</p>
      )}
      
      {(isAdmin || isHR) && (
        <Button 
          variant="outline" 
          size={isMobile ? "sm" : "default"} 
          className="mt-4 w-full sm:w-auto" 
          onClick={onAddSchedule}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Schedule
        </Button>
      )}
    </div>
  );
};

export default ScheduleList;
