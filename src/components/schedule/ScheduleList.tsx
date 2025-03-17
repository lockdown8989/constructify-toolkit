
import React from 'react';
import { format, parseISO } from 'date-fns';
import { Schedule } from '@/hooks/use-schedules';
import { Button } from '@/components/ui/button';
import { PlusCircle, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScheduleListProps {
  schedules: Schedule[];
  onAddSchedule?: () => void;
  employeeNames: Record<string, string>;
  className?: string;
}

const ScheduleList = ({ 
  schedules, 
  onAddSchedule, 
  employeeNames,
  className 
}: ScheduleListProps) => {
  const sortedSchedules = [...schedules].sort((a, b) => {
    return new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime();
  });

  return (
    <div className={cn("bg-white rounded-3xl p-6 card-shadow", className)}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium">Daily Schedule</h2>
        {onAddSchedule && (
          <Button variant="outline" size="sm" onClick={onAddSchedule}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Schedule
          </Button>
        )}
      </div>
      
      <div className="space-y-4">
        {sortedSchedules.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No schedule items for today</p>
        ) : (
          sortedSchedules.map((schedule) => (
            <div 
              key={schedule.id} 
              className="flex items-start border-l-4 border-blue-500 pl-4 py-2"
            >
              <div className="mr-4 mt-1">
                {schedule.status === 'Completed' ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <Clock className="h-5 w-5 text-amber-500" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{schedule.task}</h3>
                <p className="text-sm text-gray-500">
                  {format(parseISO(`${schedule.date}T${schedule.time}`), 'h:mm a')}
                </p>
                <p className="text-sm text-gray-500">
                  Assigned to: {employeeNames[schedule.employee_id] || 'Unknown'}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ScheduleList;
