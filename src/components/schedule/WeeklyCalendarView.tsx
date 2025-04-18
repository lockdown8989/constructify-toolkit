
import React from 'react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { type Schedule } from '@/hooks/use-schedules';

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
    
    const hasShift = daySchedules.length > 0;
    
    return {
      date,
      dayName: format(date, 'EEE'),
      dayNumber: format(date, 'd'),
      hasShift,
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
      <div className="bg-blue-500 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">MY SCHEDULE</h1>
        <div className="text-sm">{format(currentDate, 'EEE dd, MMMM yyyy').toUpperCase()}</div>
      </div>

      <CollapsibleContent>
        <div className="bg-white p-4 border-b">
          <div className="flex justify-between items-center mb-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handlePreviousWeek}
              className="text-gray-600"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            
            <div className="font-medium">
              {format(startDate, 'MMMM yyyy')}
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleNextWeek}
              className="text-gray-600"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
          
          <div className="grid grid-cols-7 gap-2 text-center">
            {weekDays.map(({ date, dayName, dayNumber, hasShift, isToday }) => (
              <div 
                key={date.toString()} 
                className={cn(
                  "p-2 relative cursor-pointer rounded-lg transition-colors",
                  isToday && "bg-blue-50",
                  "hover:bg-gray-50"
                )}
                onClick={() => onDateChange(date)}
              >
                <div className="text-sm text-gray-600">{dayName}</div>
                <div className={cn(
                  "text-lg font-semibold",
                  isToday && "text-blue-600"
                )}>
                  {dayNumber}
                </div>
                {hasShift && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default WeeklyCalendarView;
