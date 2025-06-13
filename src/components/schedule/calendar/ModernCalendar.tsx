
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
            "ios-card relative min-h-[60px] md:min-h-[80px] p-1 md:p-2 cursor-pointer transition-all duration-200 hover:bg-gray-50 border border-gray-100",
            !isSameMonth(day, monthStart) && "text-gray-400 bg-gray-50/50",
            isSameDay(day, selectedDate) && "bg-blue-50 border-blue-200",
            isToday(day) && "bg-blue-500 text-white hover:bg-blue-600"
          )}
          key={day.toString()}
          onClick={() => {
            setSelectedDate(cloneDay);
            onDateChange(cloneDay);
          }}
        >
          <div className={cn(
            "text-sm md:text-base font-medium mb-1",
            isToday(day) ? "text-white" : "text-gray-900"
          )}>
            {formattedDate}
          </div>
          
          {/* Schedule indicators */}
          <div className="space-y-0.5">
            {daySchedules.slice(0, isMobile ? 2 : 3).map((schedule, index) => (
              <div
                key={schedule.id}
                className={cn(
                  "text-xs p-1 rounded-md cursor-pointer transition-colors",
                  schedule.status === 'pending' 
                    ? "bg-orange-100 text-orange-800 border border-orange-200" 
                    : "bg-blue-100 text-blue-800 border border-blue-200"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onScheduleClick?.(schedule);
                }}
              >
                <div className="flex items-center gap-1">
                  <Clock className="h-2 w-2" />
                  <span className="truncate">
                    {format(new Date(schedule.start_time), 'HH:mm')}
                  </span>
                </div>
                <div className="truncate font-medium">
                  {schedule.title}
                </div>
              </div>
            ))}
            
            {daySchedules.length > (isMobile ? 2 : 3) && (
              <div className="text-xs text-gray-500">
                +{daySchedules.length - (isMobile ? 2 : 3)} more
              </div>
            )}
          </div>
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div className="grid grid-cols-7 gap-0.5 md:gap-1" key={day.toString()}>
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
    <div className="ios-card bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100">
        <h2 className="ios-large-title">Schedule Calendar</h2>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <Badge className="bg-orange-100 text-orange-800 border border-orange-200">
              {pendingCount} pending
            </Badge>
          )}
        </div>
      </div>

      {/* Pending shift notification */}
      {pendingCount > 0 && (
        <div className="mx-4 md:mx-6 mt-4 p-3 md:p-4 bg-orange-50 border border-orange-200 ios-rounded animate-fade-in">
          <div className="flex items-center gap-2 text-orange-800">
            <Clock className="h-5 w-5" />
            <div>
              <div className="font-medium">
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
      <div className="flex items-center justify-between p-4 md:p-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={prevMonth}
          className="ios-button touch-target"
          disabled={isLoading}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <h3 className="text-lg md:text-xl font-semibold">
          {format(selectedDate, 'MMMM yyyy')}
        </h3>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={nextMonth}
          className="ios-button touch-target"
          disabled={isLoading}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-0.5 md:gap-1 px-4 md:px-6">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-2 text-center text-xs md:text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="px-4 md:px-6 pb-4 md:pb-6 space-y-0.5 md:space-y-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          rows
        )}
      </div>

      {/* Current date display */}
      <div className="border-t border-gray-100 p-4 md:p-6 bg-gray-50/50">
        <div className="text-center">
          <div className="text-lg md:text-xl font-semibold">
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
