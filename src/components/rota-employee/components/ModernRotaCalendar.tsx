
import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, Grid3X3, List, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useSchedules } from '@/hooks/use-schedules';
import { useTheme } from '@/hooks/use-theme';

interface ModernRotaCalendarProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

type ViewMode = 'month' | 'week' | 'list';

interface ShiftType {
  type: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const shiftTypes: Record<string, ShiftType> = {
  work: {
    type: 'Work',
    color: 'text-blue-700 dark:text-blue-300',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-200 dark:border-blue-800'
  },
  holiday: {
    type: 'Holiday',
    color: 'text-green-700 dark:text-green-300',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    borderColor: 'border-green-200 dark:border-green-800'
  },
  sick: {
    type: 'Sick Leave',
    color: 'text-red-700 dark:text-red-300',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    borderColor: 'border-red-200 dark:border-red-800'
  },
  personal: {
    type: 'Personal',
    color: 'text-purple-700 dark:text-purple-300',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    borderColor: 'border-purple-200 dark:border-purple-800'
  }
};

const ModernRotaCalendar: React.FC<ModernRotaCalendarProps> = ({
  currentDate,
  onDateChange
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const { data: schedules = [] } = useSchedules();
  const { theme } = useTheme();

  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const handlePrevMonth = () => {
    const newDate = subMonths(selectedDate, 1);
    setSelectedDate(newDate);
    onDateChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = addMonths(selectedDate, 1);
    setSelectedDate(newDate);
    onDateChange(newDate);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateChange(date);
  };

  const getSchedulesForDay = (day: Date) => {
    return schedules.filter(schedule => 
      isSameDay(new Date(schedule.start_time), day)
    );
  };

  const calculateTotalHours = () => {
    const monthSchedules = schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.start_time);
      return isSameMonth(scheduleDate, selectedDate);
    });
    
    const totalHours = monthSchedules.reduce((total, schedule) => {
      const start = new Date(schedule.start_time);
      const end = new Date(schedule.end_time);
      return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }, 0);

    return Math.round(totalHours * 10) / 10;
  };

  const renderCalendarGrid = () => {
    const days = [];
    let day = startDate;

    // Week headers
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    const calendarRows = [];
    let week = [];

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const daySchedules = getSchedulesForDay(day);
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isDayToday = isToday(day);
        const isSelected = isSameDay(day, selectedDate);
        
        week.push(
          <div
            key={day.toString()}
            className={cn(
              "relative min-h-[80px] p-2 cursor-pointer transition-all duration-300 ease-out",
              "border-r border-b border-gray-100 dark:border-gray-800",
              "hover:bg-gray-50/80 dark:hover:bg-gray-800/50",
              "hover:scale-[1.02] hover:shadow-lg hover:z-10",
              !isCurrentMonth && "text-gray-400 dark:text-gray-600 bg-gray-50/30 dark:bg-gray-900/30",
              isDayToday && "bg-gradient-to-br from-blue-500/10 to-blue-600/5 dark:from-blue-400/20 dark:to-blue-500/10",
              isSelected && "bg-blue-100/50 dark:bg-blue-900/30 ring-2 ring-blue-500/30"
            )}
            onClick={() => handleDateClick(day)}
          >
            <div className={cn(
              "text-sm font-semibold mb-2",
              isDayToday && "text-blue-600 dark:text-blue-400 font-bold",
              isSelected && "text-blue-700 dark:text-blue-300"
            )}>
              {format(day, 'd')}
            </div>
            
            {/* Shift indicators */}
            <div className="space-y-1">
              {daySchedules.slice(0, 2).map((schedule, index) => {
                const shiftType = shiftTypes.work; // Default to work type
                return (
                  <div
                    key={schedule.id}
                    className={cn(
                      "text-xs px-2 py-1 rounded-md truncate",
                      "backdrop-blur-sm border",
                      shiftType.bgColor,
                      shiftType.color,
                      shiftType.borderColor,
                      "shadow-sm hover:shadow-md transition-shadow duration-200"
                    )}
                  >
                    <div className="font-medium">
                      {format(new Date(schedule.start_time), 'HH:mm')}
                    </div>
                    <div className="truncate">{schedule.title}</div>
                  </div>
                );
              })}
              
              {daySchedules.length > 2 && (
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium px-2">
                  +{daySchedules.length - 2} more
                </div>
              )}
            </div>
          </div>
        );
        
        day = addDays(day, 1);
      }
      
      calendarRows.push(
        <div key={week[0].key} className="grid grid-cols-7">
          {week}
        </div>
      );
      week = [];
    }

    return (
      <div className="overflow-hidden">
        {/* Week day headers */}
        <div className="grid grid-cols-7 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
          {weekDays.map(dayName => (
            <div key={dayName} className="py-4 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600 last:border-r-0">
              {dayName}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="bg-white dark:bg-gray-900">
          {calendarRows}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header Section */}
      <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
        <div className="p-6">
          {/* Navigation and Title */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevMonth}
                className="h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-110"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {format(selectedDate, 'MMMM yyyy')}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {format(new Date(), 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextMonth}
                className="h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-110"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            {/* Add Shift Button */}
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <Plus className="h-4 w-4 mr-2" />
              Add Shift
            </Button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center justify-center">
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 shadow-inner">
              <Button
                variant={viewMode === 'week' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('week')}
                className={cn(
                  "rounded-lg transition-all duration-300",
                  viewMode === 'week' 
                    ? "bg-white dark:bg-gray-700 shadow-md" 
                    : "hover:bg-gray-200 dark:hover:bg-gray-700"
                )}
              >
                <Grid3X3 className="h-4 w-4 mr-2" />
                Week
              </Button>
              
              <Button
                variant={viewMode === 'month' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('month')}
                className={cn(
                  "rounded-lg transition-all duration-300",
                  viewMode === 'month' 
                    ? "bg-white dark:bg-gray-700 shadow-md" 
                    : "hover:bg-gray-200 dark:hover:bg-gray-700"
                )}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Month
              </Button>
              
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={cn(
                  "rounded-lg transition-all duration-300",
                  viewMode === 'list' 
                    ? "bg-white dark:bg-gray-700 shadow-md" 
                    : "hover:bg-gray-200 dark:hover:bg-gray-700"
                )}
              >
                <List className="h-4 w-4 mr-2" />
                List
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Calendar Content */}
      <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-gray-200/50 dark:border-gray-700/50 shadow-xl overflow-hidden">
        {viewMode === 'month' && renderCalendarGrid()}
        
        {viewMode === 'week' && (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            Week view implementation coming soon...
          </div>
        )}
        
        {viewMode === 'list' && (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            List view implementation coming soon...
          </div>
        )}
      </Card>

      {/* Bottom Stats Card */}
      <Card className="backdrop-blur-xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-950/50 dark:to-indigo-950/50 border border-blue-200/50 dark:border-blue-800/50 shadow-xl">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Monthly Summary
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {format(selectedDate, 'MMMM yyyy')}
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {calculateTotalHours()}h
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Hours
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                £{(calculateTotalHours() * 15).toFixed(2)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Estimated Pay
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ModernRotaCalendar;
