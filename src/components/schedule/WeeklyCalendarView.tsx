
import React, { useEffect, useState } from 'react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { type Schedule } from '@/hooks/use-schedules';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WeeklyCalendarViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  schedules: Schedule[];
  isSyncingCalendar?: boolean;
}

const WeeklyCalendarView: React.FC<WeeklyCalendarViewProps> = ({
  currentDate,
  onDateChange,
  schedules,
  isSyncingCalendar = false
}) => {
  const { toast } = useToast();
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start from Monday

  // Subscribe to real-time updates for schedules
  useEffect(() => {
    const channel = supabase
      .channel('schedule_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'schedules'
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            toast({
              title: "Schedule Updated",
              description: "Your schedule has been updated.",
            });
          } else if (payload.eventType === 'INSERT') {
            toast({
              title: "New Schedule",
              description: "A new schedule has been assigned to you.",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);
  
  const weekDays = Array.from({ length: 7 }).map((_, index) => {
    const date = addDays(startDate, index);
    const daySchedules = schedules.filter(schedule => 
      isSameDay(new Date(schedule.start_time), date)
    );
    
    const hasOpenShift = daySchedules.some(s => s.status === 'pending');
    const hasAcceptedShift = daySchedules.some(s => s.status === 'confirmed');
    
    return {
      date,
      dayName: format(date, 'EEE'),
      dayNumber: format(date, 'd'),
      hasOpenShift,
      hasAcceptedShift,
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
            {weekDays.map(({ date, dayName, dayNumber, hasOpenShift, hasAcceptedShift, isToday }) => (
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
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1">
                  {hasOpenShift && (
                    <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
                  )}
                  {hasAcceptedShift && (
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default WeeklyCalendarView;
