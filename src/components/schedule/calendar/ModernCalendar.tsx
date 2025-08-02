
import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
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
            "relative h-32 p-2 cursor-pointer transition-all duration-150 border-r border-b border-slate-100 bg-white hover:bg-slate-50/80",
            !isSameMonth(day, monthStart) && "text-slate-400 bg-slate-50/40",
            isSameDay(day, selectedDate) && "bg-blue-50 border-blue-200 ring-1 ring-blue-200/50",
            isToday(day) && "bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-sm"
          )}
          key={day.toString()}
          onClick={() => {
            setSelectedDate(cloneDay);
            onDateChange(cloneDay);
          }}
        >
          {/* Date number */}
          <div className={cn(
            "text-sm font-medium mb-2 flex items-center justify-between",
            isToday(day) ? "text-white" : "text-slate-700",
            !isSameMonth(day, monthStart) && "text-slate-400"
          )}>
            <span>{formattedDate}</span>
            {daySchedules.length > 0 && (
              <div className={cn(
                "w-2 h-2 rounded-full",
                isToday(day) ? "bg-white/80" : "bg-blue-500"
              )} />
            )}
          </div>
          
          {/* Schedule items */}
          <div className="space-y-1">
            {daySchedules.slice(0, isMobile ? 2 : 3).map((schedule, index) => (
              <div
                key={schedule.id}
                className={cn(
                  "text-xs px-2 py-1 rounded-md cursor-pointer transition-all duration-150 truncate border",
                  schedule.status === 'incomplete'
                    ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                    : schedule.status === 'pending' 
                    ? "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100" 
                    : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onScheduleClick?.(schedule);
                }}
              >
                <div className="flex items-center gap-1 mb-0.5">
                  {schedule.status === 'incomplete' ? (
                    <span className="text-red-600 font-bold text-xs">✗</span>
                  ) : (
                    <Clock className="h-2.5 w-2.5 flex-shrink-0" />
                  )}
                  <span className="font-medium text-xs">
                    {format(new Date(schedule.start_time), 'HH:mm')}
                  </span>
                </div>
                <div className="truncate font-medium text-xs">
                  {schedule.title}
                </div>
              </div>
            ))}
            
            {daySchedules.length > (isMobile ? 2 : 3) && (
              <div className="text-xs text-slate-500 font-medium px-2 py-1 bg-slate-100 rounded-md border border-slate-200">
                +{daySchedules.length - (isMobile ? 2 : 3)} more
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
  const incompleteCount = schedules.filter(s => s.status === 'incomplete').length;

  return (
    <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
      {/* Header Section */}
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-700 rounded-lg">
              <CalendarIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Schedule Calendar</h2>
              <p className="text-sm text-slate-600">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {incompleteCount > 0 && (
              <Badge className="bg-red-100 text-red-700 border border-red-200 px-3 py-1 hover:bg-red-200">
                <span className="mr-1">✗</span>
                {incompleteCount} incomplete
              </Badge>
            )}
            {pendingCount > 0 && (
              <Badge className="bg-orange-100 text-orange-700 border border-orange-200 px-3 py-1 hover:bg-orange-200">
                <AlertCircle className="h-3 w-3 mr-1" />
                {pendingCount} pending
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Pending Notifications Section */}
      {pendingCount > 0 && (
        <div className="mx-6 my-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg">
          <div className="flex items-start gap-3 text-orange-800">
            <div className="p-1.5 bg-orange-200 rounded-full mt-0.5">
              <Clock className="h-3.5 w-3.5" />
            </div>
            <div>
              <div className="font-medium text-orange-900 text-sm">
                {pendingCount} shift{pendingCount > 1 ? 's' : ''} awaiting response
              </div>
              {schedules
                .filter(s => s.status === 'pending')
                .slice(0, 1)
                .map(schedule => (
                  <div key={schedule.id} className="text-sm mt-1 text-orange-700">
                    {schedule.title} • {format(new Date(schedule.start_time), 'EEE, MMM d')}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Month Navigation Section */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200">
        <Button
          variant="ghost"
          size="sm"
          onClick={prevMonth}
          className="h-8 w-8 p-0 hover:bg-slate-100 rounded-md"
          disabled={isLoading}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <h3 className="text-base font-semibold text-slate-900">
          {format(selectedDate, 'MMMM yyyy')}
        </h3>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={nextMonth}
          className="h-8 w-8 p-0 hover:bg-slate-100 rounded-md"
          disabled={isLoading}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day Headers Section */}
      <div className="grid grid-cols-7 bg-slate-100 border-b border-slate-200">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-3 text-center text-xs font-semibold text-slate-700 border-r border-slate-200 last:border-r-0 uppercase tracking-wide">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid Section */}
      <div className="bg-white">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-600"></div>
              <p className="text-sm text-slate-500">Loading calendar...</p>
            </div>
          </div>
        ) : (
          <div>
            {rows}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernCalendar;
