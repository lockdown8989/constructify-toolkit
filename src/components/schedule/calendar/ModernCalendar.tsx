
import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { Schedule } from '@/hooks/use-schedules';

interface ModernCalendarProps {
  schedules: Schedule[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onScheduleClick?: (schedule: Schedule) => void;
  isLoading?: boolean;
}

const ModernCalendar: React.FC<ModernCalendarProps> = ({
  schedules,
  currentDate,
  onDateChange,
  onScheduleClick,
  isLoading = false
}) => {
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const isMobile = useIsMobile();

  useEffect(() => {
    setSelectedDate(currentDate);
  }, [currentDate]);

  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateFormat = "d";
  const rows = [];
  let days = [];
  let day = startDate;
  let formattedDate = "";

  // Generate calendar grid
  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, dateFormat);
      const cloneDay = day;
      const daySchedules = schedules.filter(schedule => 
        isSameDay(new Date(schedule.start_time), day)
      );
      
      days.push(
        <div
          className={cn(
            "relative min-h-[80px] md:min-h-[100px] p-2 cursor-pointer transition-all duration-200 border border-gray-100 bg-white hover:bg-gray-50",
            !isSameMonth(day, monthStart) && "text-gray-300 bg-gray-50/50",
            isSameDay(day, selectedDate) && "bg-blue-50 border-blue-200 ring-1 ring-blue-200",
            isToday(day) && "bg-blue-500 text-white hover:bg-blue-600 border-blue-500"
          )}
          key={day.toString()}
          onClick={() => {
            setSelectedDate(cloneDay);
            onDateChange(cloneDay);
          }}
        >
          <div className={cn(
            "text-sm md:text-base font-semibold mb-2",
            isToday(day) ? "text-white" : "text-gray-900",
            !isSameMonth(day, monthStart) && "text-gray-400"
          )}>
            {formattedDate}
          </div>
          
          {/* Schedule indicators */}
          <div className="space-y-1">
            {daySchedules.slice(0, isMobile ? 1 : 2).map((schedule, index) => (
              <div
                key={schedule.id}
                className={cn(
                  "text-xs p-1.5 rounded-md cursor-pointer transition-colors truncate",
                  schedule.status === 'pending' 
                    ? "bg-orange-100 text-orange-800 border border-orange-200 hover:bg-orange-200" 
                    : "bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onScheduleClick?.(schedule);
                }}
              >
                <div className="flex items-center gap-1">
                  <Clock className="h-2.5 w-2.5 flex-shrink-0" />
                  <span className="font-medium">
                    {format(new Date(schedule.start_time), 'HH:mm')}
                  </span>
                </div>
                <div className="truncate font-medium mt-0.5">
                  {schedule.title}
                </div>
              </div>
            ))}
            
            {daySchedules.length > (isMobile ? 1 : 2) && (
              <div className="text-xs text-gray-500 font-medium px-1">
                +{daySchedules.length - (isMobile ? 1 : 2)} more
              </div>
            )}
          </div>
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div className="grid grid-cols-7" key={day.toString()}>
        {days}
      </div>
    );
    days = [];
  }

  const prevMonth = () => {
    const newDate = subMonths(selectedDate, 1);
    setSelectedDate(newDate);
    onDateChange(newDate);
  };

  const nextMonth = () => {
    const newDate = addMonths(selectedDate, 1);
    setSelectedDate(newDate);
    onDateChange(newDate);
  };

  const pendingCount = schedules.filter(s => s.status === 'pending').length;

  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Schedule Calendar</h2>
          {pendingCount > 0 && (
            <Badge className="bg-orange-100 text-orange-800 border border-orange-200">
              {pendingCount} pending
            </Badge>
          )}
        </div>
      </div>

      {/* Pending shift notification */}
      {pendingCount > 0 && (
        <div className="mx-6 mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-start gap-3 text-orange-800">
            <Clock className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-semibold">
                You have {pendingCount} pending shift{pendingCount > 1 ? 's' : ''} waiting for response
              </div>
              {schedules
                .filter(s => s.status === 'pending')
                .slice(0, 1)
                .map(schedule => (
                  <div key={schedule.id} className="text-sm mt-1">
                    {schedule.title} on {format(new Date(schedule.start_time), 'EEE, MMM d')}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Month navigation */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <Button
          variant="ghost"
          size="sm"
          onClick={prevMonth}
          className="h-8 w-8 p-0 hover:bg-gray-100"
          disabled={isLoading}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <h3 className="text-lg font-semibold text-gray-900">
          {format(selectedDate, 'MMMM yyyy')}
        </h3>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={nextMonth}
          className="h-8 w-8 p-0 hover:bg-gray-100"
          disabled={isLoading}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-3 text-center text-sm font-semibold text-gray-700 border-r border-gray-100 last:border-r-0 bg-gray-50">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="bg-white">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-0">
            {rows}
          </div>
        )}
      </div>

      {/* Footer with current date/time */}
      <div className="border-t border-gray-100 px-6 py-4 bg-gray-50">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {format(new Date(), 'h:mm a')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernCalendar;
