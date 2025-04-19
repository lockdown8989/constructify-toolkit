
import React from 'react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Bell, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { type Schedule } from '@/hooks/use-schedules';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

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
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
  
  const weekDays = Array.from({ length: 7 }).map((_, index) => {
    const date = addDays(startDate, index);
    const daySchedules = schedules.filter(schedule => 
      isSameDay(new Date(schedule.start_time), date)
    );
    
    return {
      date,
      dayName: format(date, 'EEE'),
      dayNumber: format(date, 'd'),
      schedules: daySchedules,
      hasOpenShift: daySchedules.some(s => s.status === 'pending'),
      hasAcceptedShift: daySchedules.some(s => s.status === 'confirmed'),
      hasCompletedShift: daySchedules.some(s => s.status === 'completed'),
      isToday: isSameDay(date, new Date())
    };
  });

  const handlePreviousWeek = () => onDateChange(addDays(startDate, -7));
  const handleNextWeek = () => onDateChange(addDays(startDate, 7));

  return (
    <Collapsible className="w-full">
      <div className="bg-gray-50 p-4 flex justify-between items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handlePreviousWeek}
          className="text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        
        <div className="font-medium text-lg">
          {format(startDate, 'MMMM yyyy')}
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleNextWeek}
          className="text-gray-600 hover:text-gray-900"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      <CollapsibleContent>
        <ScrollArea className="h-[600px]">
          <div className="grid grid-cols-7 gap-2 p-4">
            {weekDays.map(({ date, dayName, dayNumber, schedules: daySchedules, hasOpenShift, hasAcceptedShift, hasCompletedShift, isToday }) => (
              <div 
                key={date.toString()} 
                className={cn(
                  "min-h-[120px] p-3 relative rounded-xl transition-colors border",
                  isToday ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50 border-gray-100",
                  "cursor-pointer group"
                )}
                onClick={() => onDateChange(date)}
              >
                <div className="text-sm text-gray-600">{dayName}</div>
                <div className={cn(
                  "text-lg font-semibold mb-2",
                  isToday && "text-blue-600"
                )}>
                  {dayNumber}
                </div>
                
                {daySchedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className={cn(
                      "text-xs p-1.5 mb-1 rounded-md",
                      schedule.status === 'confirmed' ? "bg-green-100 text-green-800 border border-green-200" :
                      schedule.status === 'pending' ? "bg-orange-100 text-orange-800 border border-orange-200" :
                      "bg-gray-100 text-gray-800 border border-gray-200"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span>{format(new Date(schedule.start_time), 'HH:mm')}</span>
                      {schedule.status === 'completed' && (
                        <Check className="h-3 w-3 text-green-600" />
                      )}
                    </div>
                    <div className="truncate">{schedule.title}</div>
                  </div>
                ))}
                
                {(hasOpenShift || hasAcceptedShift || hasCompletedShift) && (
                  <div className="absolute top-2 right-2 flex gap-1">
                    {hasOpenShift && (
                      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 px-1.5">
                        {daySchedules.filter(s => s.status === 'pending').length}
                      </Badge>
                    )}
                    {hasAcceptedShift && (
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                    )}
                    {hasCompletedShift && (
                      <Check className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default WeeklyCalendarView;
