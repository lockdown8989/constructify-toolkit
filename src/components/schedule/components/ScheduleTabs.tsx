
import React, { useState, useEffect } from 'react';
import { Schedule } from '@/hooks/use-schedules';
import ShiftDetailCard from '../ShiftDetailCard';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addDays, isSameMonth, isToday } from 'date-fns';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface ScheduleTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  schedules: Schedule[];
  newSchedules: Record<string, boolean>;
  onInfoClick: (scheduleId: string) => void;
  onEmailClick: (schedule: Schedule) => void;
  onCancelClick: (scheduleId: string) => void;
  onResponseComplete?: () => void;
}

export const ScheduleTabs: React.FC<ScheduleTabsProps> = ({
  activeTab,
  setActiveTab,
  schedules,
  newSchedules,
  onInfoClick,
  onEmailClick,
  onCancelClick,
  onResponseComplete,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<(Date | null)[]>([]);
  
  const tabs = [
    { id: 'my-shifts', label: 'My Shifts' },
    { id: 'open-shifts', label: 'Open Shifts' },
    { id: 'pending', label: 'Pending' },
    { id: 'completed', label: 'Completed' }
  ];

  const daysOfWeek = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  // Generate calendar grid whenever the current date changes
  useEffect(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Find the day of the week the month starts on (0 = Sunday, 1 = Monday, etc.)
    // Adjusting for Monday as first day of week
    const startDayIndex = getDay(monthStart) === 0 ? 6 : getDay(monthStart) - 1;
    
    // Create a grid for the calendar
    const grid: (Date | null)[] = [];
    
    // Add empty cells for days before the month starts
    for (let i = 0; i < startDayIndex; i++) {
      grid.push(null);
    }
    
    // Add all days of the month
    grid.push(...monthDays);
    
    // Add empty cells to complete the grid (total of 42 cells for 6 weeks)
    const remainingCells = 42 - grid.length;
    for (let i = 0; i < remainingCells; i++) {
      grid.push(null);
    }
    
    setCalendarDays(grid);
  }, [currentDate]);

  // Count pending shifts for the badge
  const pendingShiftsCount = schedules.filter(s => s.status === 'pending').length;

  const handlePreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const filteredSchedules = schedules.filter(schedule => {
    switch (activeTab) {
      case 'my-shifts':
        return schedule.status === 'confirmed';
      case 'pending':
        return schedule.status === 'pending';
      case 'completed':
        return schedule.status === 'completed';
      default:
        return true;
    }
  });

  // Debug log filtered schedules
  console.log(`Filtered schedules for tab ${activeTab}:`, filteredSchedules.length);

  // Function to check if a day has a scheduled shift
  const hasScheduledShift = (day: Date | null) => {
    if (!day) return false;
    
    return schedules.some(schedule => {
      const scheduleDate = new Date(schedule.start_time);
      return scheduleDate.getDate() === day.getDate() && 
             scheduleDate.getMonth() === day.getMonth() && 
             scheduleDate.getFullYear() === day.getFullYear();
    });
  };

  // Function to check if a day has a pending shift
  const hasPendingShift = (day: Date | null) => {
    if (!day) return false;
    
    return schedules.some(schedule => {
      const scheduleDate = new Date(schedule.start_time);
      return schedule.status === 'pending' && 
             scheduleDate.getDate() === day.getDate() && 
             scheduleDate.getMonth() === day.getMonth() && 
             scheduleDate.getFullYear() === day.getFullYear();
    });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Calendar Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <button onClick={handlePreviousMonth} className="p-1">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h2 className="text-2xl font-bold">{format(currentDate, 'MMMM yyyy')}</h2>
          <button onClick={handleNextMonth} className="p-1">
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
        
        {/* Calendar Days Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {daysOfWeek.map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, i) => (
            <div
              key={i}
              className={cn(
                "aspect-square flex flex-col items-center justify-center text-sm border rounded-lg relative",
                day ? (isToday(day) ? "border-blue-500 border-2" : "border-gray-200") : "border-transparent",
                day && isSameMonth(day, currentDate) ? "bg-white" : "bg-gray-50 text-gray-400",
                day && hasScheduledShift(day) && "font-bold"
              )}
            >
              {day ? format(day, 'd') : ''}
              {day && hasScheduledShift(day) && (
                <span className={cn(
                  "h-2 w-2 rounded-full mt-1",
                  hasPendingShift(day) ? "bg-amber-400" : "bg-blue-500"
                )}></span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 py-2 text-sm font-medium border-b-2 transition-colors relative",
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              {tab.label}
              {tab.id === 'pending' && pendingShiftsCount > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs">
                  {pendingShiftsCount}
                </Badge>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Shift Cards */}
      <Tabs value={activeTab} defaultValue={activeTab}>
        <TabsContent value={activeTab} className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredSchedules.length > 0 ? (
            filteredSchedules.map(schedule => (
              <ShiftDetailCard
                key={schedule.id}
                schedule={schedule}
                onInfoClick={() => onInfoClick(schedule.id)}
                onEmailClick={() => onEmailClick(schedule)}
                onCancelClick={() => onCancelClick(schedule.id)}
                onResponseComplete={onResponseComplete}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 flex flex-col items-center">
              <AlertCircle className="h-6 w-6 mb-2 text-gray-400" />
              <p>No {activeTab.replace('-', ' ')} found</p>
              {activeTab === 'pending' && (
                <p className="text-sm mt-2">When managers assign you shifts that need confirmation, they'll appear here</p>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
