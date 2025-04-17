
import React from 'react';
import { format, startOfWeek, addDays, isToday } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { type Schedule } from '@/hooks/use-schedules';

interface WeekViewProps {
  currentDate: Date;
  schedules: Schedule[];
  getEventColor: (index: number) => string;
}

const WeekView = ({ currentDate, schedules, getEventColor }: WeekViewProps) => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const startOfTheWeek = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfTheWeek, i));
  
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, index) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const daySchedules = schedules.filter(schedule => 
            schedule.start_time.includes(dateStr)
          );
          const isCurrentDay = isToday(day);
          
          return (
            <div 
              key={index} 
              className={cn(
                "border rounded-xl p-2 min-h-[150px]",
                isCurrentDay ? "bg-blue-50/50 border-blue-200" : "bg-white border-gray-100"
              )}
            >
              <div className={cn(
                "text-center font-medium mb-3 p-1 rounded-lg",
                isCurrentDay ? "bg-blue-500 text-white" : "text-gray-700"
              )}>
                <div className="text-xs uppercase tracking-wide">
                  {format(day, 'EEE')}
                </div>
                <div className="text-lg font-bold">
                  {format(day, 'd')}
                </div>
              </div>
              
              <div className="space-y-2">
                {daySchedules.length === 0 && (
                  <div className="text-xs text-gray-400 text-center py-2">No events</div>
                )}
                
                {daySchedules.map((schedule, idx) => (
                  <Card 
                    key={schedule.id} 
                    className={cn(
                      "p-2 border-l-4 text-xs hover:shadow-md transition-shadow duration-200",
                      getEventColor(idx)
                    )}
                  >
                    <div className="font-medium truncate">{schedule.title}</div>
                    <div className="flex items-center mt-1 text-gray-600">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatInTimeZone(new Date(schedule.start_time), timeZone, 'h:mm a')}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeekView;
