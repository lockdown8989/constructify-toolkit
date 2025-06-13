
import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon } from 'lucide-react';
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
            "relative min-h-[100px] md:min-h-[120px] p-3 cursor-pointer transition-all duration-200 border border-gray-100/80 bg-white hover:bg-gray-50/80",
            !isSameMonth(day, monthStart) && "text-gray-300 bg-gray-50/30",
            isSameDay(day, selectedDate) && "bg-blue-50/80 border-blue-200 ring-1 ring-blue-200",
            isToday(day) && "bg-blue-500 text-white hover:bg-blue-600 border-blue-500 shadow-md"
          )}
          key={day.toString()}
          onClick={() => {
            setSelectedDate(cloneDay);
            onDateChange(cloneDay);
          }}
        >
          {/* Date number */}
          <div className={cn(
            "text-sm md:text-base font-semibold mb-3",
            isToday(day) ? "text-white" : "text-gray-900",
            !isSameMonth(day, monthStart) && "text-gray-400"
          )}>
            {formattedDate}
          </div>
          
          {/* Schedule items */}
          <div className="space-y-1.5">
            {daySchedules.slice(0, isMobile ? 2 : 3).map((schedule, index) => (
              <div
                key={schedule.id}
                className={cn(
                  "text-xs p-2 rounded-lg cursor-pointer transition-all duration-200 truncate shadow-sm",
                  schedule.status === 'pending' 
                    ? "bg-orange-100 text-orange-800 border border-orange-200 hover:bg-orange-200 hover:shadow-md" 
                    : "bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200 hover:shadow-md"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onScheduleClick?.(schedule);
                }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Clock className="h-2.5 w-2.5 flex-shrink-0" />
                  <span className="font-medium">
                    {format(new Date(schedule.start_time), 'HH:mm')}
                  </span>
                </div>
                <div className="truncate font-medium">
                  {schedule.title}
                </div>
              </div>
            ))}
            
            {daySchedules.length > (isMobile ? 2 : 3) && (
              <div className="text-xs text-gray-500 font-medium px-2 py-1 bg-gray-100 rounded-md">
                +{daySchedules.length - (isMobile ? 2 : 3)} more
              </div>
            )}
          </div>
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div className="grid grid-cols-7 gap-0" key={day.toString()}>
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
    <div className="bg-white shadow-lg border border-gray-200/50 rounded-2xl overflow-hidden">
      {/* Header Section */}
      <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <CalendarIcon className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Schedule Calendar</h2>
          </div>
          {pendingCount > 0 && (
            <Badge className="bg-orange-500 text-white border-0 shadow-md px-3 py-1">
              {pendingCount} pending
            </Badge>
          )}
        </div>
      </div>

      {/* Pending Notifications Section */}
      {pendingCount > 0 && (
        <div className="mx-6 mt-5 mb-4 p-4 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-xl shadow-sm">
          <div className="flex items-start gap-3 text-orange-800">
            <div className="p-1 bg-orange-200 rounded-full mt-0.5">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <div className="font-semibold text-orange-900">
                You have {pendingCount} pending shift{pendingCount > 1 ? 's' : ''} waiting for response
              </div>
              {schedules
                .filter(s => s.status === 'pending')
                .slice(0, 1)
                .map(schedule => (
                  <div key={schedule.id} className="text-sm mt-1 text-orange-700">
                    {schedule.title} on {format(new Date(schedule.start_time), 'EEE, MMM d')}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Month Navigation Section */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50 border-b border-gray-200/50">
        <Button
          variant="ghost"
          size="sm"
          onClick={prevMonth}
          className="h-9 w-9 p-0 hover:bg-gray-200 rounded-lg"
          disabled={isLoading}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <h3 className="text-lg font-semibold text-gray-900 px-4">
          {format(selectedDate, 'MMMM yyyy')}
        </h3>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={nextMonth}
          className="h-9 w-9 p-0 hover:bg-gray-200 rounded-lg"
          disabled={isLoading}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Day Headers Section */}
      <div className="grid grid-cols-7 bg-gray-100 border-b border-gray-200">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-4 text-center text-sm font-semibold text-gray-700 border-r border-gray-200/50 last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid Section */}
      <div className="bg-white">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="text-sm text-gray-500">Loading calendar...</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200/50">
            {rows}
          </div>
        )}
      </div>

      {/* Footer Section */}
      <div className="border-t border-gray-200/50 px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Current time: {format(new Date(), 'h:mm a')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernCalendar;
