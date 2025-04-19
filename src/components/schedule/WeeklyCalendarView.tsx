
import React from 'react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start from Monday
  
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
      isToday: isSameDay(date, new Date())
    };
  });

  const handlePreviousWeek = () => {
    onDateChange(addDays(startDate, -7));
  };

  const handleNextWeek = () => {
    onDateChange(addDays(startDate, 7));
  };

  return (
    <Collapsible className="w-full">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex justify-between items-center rounded-t-xl">
        <h1 className="text-xl font-bold">MY SCHEDULE</h1>
        <div className="text-sm opacity-90">{format(currentDate, 'EEE dd, MMMM yyyy').toUpperCase()}</div>
      </div>

      <CollapsibleContent>
        <ScrollArea className="h-[500px]">
          <div className="bg-white p-4 border-b">
            <div className="flex justify-between items-center mb-4">
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
            
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map(({ date, dayName, dayNumber, schedules: daySchedules, hasOpenShift, hasAcceptedShift, isToday }) => (
                <div 
                  key={date.toString()} 
                  className={cn(
                    "p-3 relative rounded-xl transition-colors border",
                    isToday ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50 border-gray-100",
                    "cursor-pointer"
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
                  
                  {daySchedules.map((schedule, index) => (
                    <div
                      key={schedule.id}
                      className={cn(
                        "text-xs p-1 mb-1 rounded truncate",
                        schedule.status === 'confirmed' ? "bg-green-100 text-green-700" :
                        schedule.status === 'pending' ? "bg-yellow-100 text-yellow-700" :
                        "bg-gray-100 text-gray-700"
                      )}
                    >
                      {format(new Date(schedule.start_time), 'HH:mm')} - {schedule.title}
                      {schedule.is_published === false && (
                        <Bell className="h-3 w-3 inline ml-1 text-blue-500 animate-pulse" />
                      )}
                    </div>
                  ))}
                  
                  {daySchedules.length > 0 && (
                    <div className="absolute top-2 right-2 flex gap-1">
                      {hasOpenShift && (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          {daySchedules.filter(s => s.status === 'pending').length}
                        </Badge>
                      )}
                      {hasAcceptedShift && (
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default WeeklyCalendarView;
