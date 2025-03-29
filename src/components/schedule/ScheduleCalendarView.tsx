
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Schedule } from '@/hooks/use-schedules';
import { useIsMobile } from '@/hooks/use-mobile';

interface ScheduleCalendarViewProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  schedules: Schedule[];
  schedulesLoading: boolean;
  employeeNames: Record<string, string>;
  onAddSchedule: () => void;
  isAdmin: boolean;
  isHR: boolean;
}

const ScheduleCalendarView: React.FC<ScheduleCalendarViewProps> = ({
  date,
  setDate,
  schedules,
  schedulesLoading,
  employeeNames,
  onAddSchedule,
  isAdmin,
  isHR
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 card-shadow">
      <h2 className="text-lg sm:text-xl font-medium mb-4">Company Calendar</h2>
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="w-full"
        disabled={false}
        classNames={{
          day_today: "bg-black text-white",
          day_selected: "bg-teampulse-accent text-black",
          cell: "text-center p-0 relative [&:has([aria-selected])]:bg-teampulse-accent/10 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
          head_cell: "text-gray-500 text-xs sm:text-sm w-9 font-normal",
          nav_button: "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100",
          caption: "text-sm sm:text-base",
          root: "w-full",
          table: "w-full border-collapse space-y-1",
          row: "flex w-full mt-2",
        }}
      />
      
      <div className="mt-4">
        <h3 className="font-medium text-base sm:text-lg mb-2">
          {date ? format(date, 'MMMM d, yyyy') : 'Select a date'}
        </h3>
        {schedulesLoading ? (
          <p className="text-sm">Loading schedules...</p>
        ) : schedules.length > 0 ? (
          <ul className="space-y-2 max-h-[40vh] overflow-y-auto">
            {schedules.map(schedule => (
              <li key={schedule.id} className="flex items-center py-1 text-sm border-b border-gray-100">
                <span className="w-14 text-xs sm:text-sm text-gray-500">
                  {format(new Date(schedule.start_time), 'h:mm a')}
                </span>
                <span className="flex-1 truncate">{schedule.title}</span>
                <span className="text-xs sm:text-sm text-gray-500 truncate max-w-[80px] sm:max-w-none">
                  {employeeNames[schedule.employee_id] || 'Unknown'}
                </span>
              </li>
            ))}
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
    </div>
  );
};

export default ScheduleCalendarView;
