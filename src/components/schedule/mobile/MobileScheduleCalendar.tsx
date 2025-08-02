import React, { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Schedule } from '@/hooks/use-schedules';

interface MobileScheduleCalendarProps {
  schedules: Schedule[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onScheduleClick?: (schedule: Schedule) => void;
  isLoading?: boolean;
  onRefresh?: () => void;
}

const MobileScheduleCalendar: React.FC<MobileScheduleCalendarProps> = ({
  schedules,
  currentDate,
  onDateChange,
  onScheduleClick,
  isLoading = false,
  onRefresh
}) => {
  const [selectedDate, setSelectedDate] = useState(currentDate);

  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const getSchedulesForDate = (date: Date) => {
    return schedules.filter(schedule => 
      isSameDay(new Date(schedule.start_time), date)
    );
  };

  const getDateStatus = (date: Date) => {
    const daySchedules = getSchedulesForDate(date);
    if (daySchedules.length === 0) return 'empty';
    
    const hasIncomplete = daySchedules.some(s => s.status === 'incomplete');
    const hasPending = daySchedules.some(s => s.status === 'pending');
    const hasConfirmed = daySchedules.some(s => s.status === 'confirmed' || s.status === 'employee_accepted');
    const hasCompleted = daySchedules.some(s => s.status === 'completed');
    
    if (hasIncomplete) return 'incomplete';
    if (hasPending) return 'pending';
    if (hasCompleted) return 'completed';
    if (hasConfirmed) return 'confirmed';
    return 'empty';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'incomplete': return 'bg-gradient-to-br from-red-500 to-red-600';
      case 'pending': return 'bg-gradient-to-br from-orange-400 to-orange-500';
      case 'confirmed': return 'bg-gradient-to-br from-blue-400 to-blue-500';
      case 'completed': return 'bg-gradient-to-br from-green-400 to-green-500';
      default: return 'bg-muted';
    }
  };

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'incomplete': return '✗';
      case 'pending': return '!';
      case 'confirmed': return '✓';
      case 'completed': return '✓';
      default: return 'N';
    }
  };

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

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateChange(date);
    const daySchedules = getSchedulesForDate(date);
    if (daySchedules.length === 1) {
      onScheduleClick?.(daySchedules[0]);
    }
  };

  // Generate calendar grid
  const rows = [];
  let days = [];
  let day = startDate;

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const cloneDay = day;
      const daySchedules = getSchedulesForDate(day);
      const status = getDateStatus(day);
      const isSelected = isSameDay(day, selectedDate);
      const isCurrentMonth = isSameMonth(day, monthStart);
      
      days.push(
        <div
          key={day.toString()}
          className={cn(
            "relative aspect-square touch-target flex flex-col items-center justify-center p-1 rounded-lg transition-all duration-200 active:scale-95",
            isCurrentMonth ? "text-foreground" : "text-muted-foreground",
            isSelected && "ring-2 ring-primary ring-offset-2",
            isToday(day) && "ring-2 ring-primary"
          )}
          onClick={() => handleDateClick(cloneDay)}
        >
          {/* Status background */}
          <div className={cn(
            "absolute inset-0 rounded-lg opacity-20",
            isCurrentMonth && getStatusColor(status)
          )} />
          
          {/* Date content */}
          <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
            <span className={cn(
              "text-sm font-semibold mb-0.5",
              isToday(day) && "text-primary"
            )}>
              {format(day, 'd')}
            </span>
            
            {/* Status indicator */}
            {isCurrentMonth && (
              <div className={cn(
                "text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center text-white",
                getStatusColor(status)
              )}>
                {status !== 'empty' ? getStatusIndicator(status) : ''}
              </div>
            )}
            
            {/* Shift count dot */}
            {daySchedules.length > 1 && (
              <div className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
            )}
          </div>
        </div>
      );
      day = addDays(day, 1);
    }
    
    rows.push(
      <div key={day.toString()} className="grid grid-cols-7 gap-1 mb-1">
        {days}
      </div>
    );
    days = [];
  }

  return (
    <div className="bg-card rounded-lg border shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Schedule</h2>
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>
          )}
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between p-4 border-b">
        <Button
          variant="ghost"
          size="sm"
          onClick={prevMonth}
          disabled={isLoading}
          className="touch-target"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <h3 className="text-base font-semibold">
          {format(selectedDate, 'MMMM yyyy')}
        </h3>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={nextMonth}
          disabled={isLoading}
          className="touch-target"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 p-3 pb-0">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <div key={index} className="text-xs font-medium text-center text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="p-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div>{rows}</div>
        )}
      </div>

      {/* Legend */}
      <div className="p-4 pt-0">
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-red-500 to-red-600"></div>
            <span className="text-muted-foreground">Incomplete</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-orange-400 to-orange-500"></div>
            <span className="text-muted-foreground">Pending</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-400 to-blue-500"></div>
            <span className="text-muted-foreground">Confirmed</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-green-400 to-green-500"></div>
            <span className="text-muted-foreground">Completed</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileScheduleCalendar;