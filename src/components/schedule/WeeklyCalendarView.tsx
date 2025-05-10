
import React, { useState, useEffect } from 'react';
import { addDays, format, startOfWeek, subDays, isSameDay, isWithinInterval } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Schedule } from '@/hooks/use-schedules';
import ShiftDetailCard from './ShiftDetailCard';
import { cn } from '@/lib/utils';

interface WeeklyCalendarViewProps {
  startDate: Date;
  onDateChange: (date: Date) => void;
  schedules: Schedule[];
  onShiftDrop?: (shiftId: string) => void;
  highlightedShiftId?: string | null;
}

const WeeklyCalendarView: React.FC<WeeklyCalendarViewProps> = ({
  startDate,
  onDateChange,
  schedules,
  onShiftDrop,
  highlightedShiftId
}) => {
  const [weekDays, setWeekDays] = useState<Date[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [daySchedules, setDaySchedules] = useState<Schedule[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState<number | null>(null);

  // Generate week days whenever the start date changes
  useEffect(() => {
    const days = [];
    const weekStart = startOfWeek(startDate, { weekStartsOn: 1 }); // Week starts on Monday
    
    for (let i = 0; i < 7; i++) {
      days.push(addDays(weekStart, i));
    }
    
    setWeekDays(days);
    setSelectedDay(startDate); // Set the selected day to the start date
  }, [startDate]);

  // Update day schedules whenever selected day or schedules change
  useEffect(() => {
    if (!selectedDay) return;
    
    // Filter schedules for the selected day
    const filteredSchedules = schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.start_time);
      return isSameDay(scheduleDate, selectedDay);
    });
    
    setDaySchedules(filteredSchedules);
  }, [selectedDay, schedules]);

  // Handle previous/next week navigation
  const handlePreviousWeek = () => {
    const newStartDate = subDays(weekDays[0], 7);
    onDateChange(newStartDate);
  };

  const handleNextWeek = () => {
    const newStartDate = addDays(weekDays[0], 7);
    onDateChange(newStartDate);
  };

  // Handle day selection
  const handleDayClick = (day: Date) => {
    setSelectedDay(day);
    onDateChange(day);
  };

  // Handle drag events
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setIsDraggingOver(index);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    // Get the shift ID from the drag event
    const shiftId = e.dataTransfer.getData('shiftId');
    
    if (shiftId && onShiftDrop) {
      onShiftDrop(shiftId);
    }
    
    setIsDraggingOver(null);
  };

  return (
    <div className="bg-white rounded-lg p-4">
      {/* Week navigation */}
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" size="sm" onClick={handlePreviousWeek}>
          <ChevronLeft className="h-4 w-4" />
          <span className="ml-1">Previous Week</span>
        </Button>
        
        <h2 className="font-medium">
          {format(weekDays[0] || startDate, 'MMM d')} - {format(weekDays[6] || addDays(startDate, 6), 'MMM d, yyyy')}
        </h2>
        
        <Button variant="outline" size="sm" onClick={handleNextWeek}>
          <span className="mr-1">Next Week</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Week days */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {weekDays.map((day, index) => {
          const isSelected = selectedDay && isSameDay(day, selectedDay);
          const hasSchedule = schedules.some(schedule => {
            const scheduleDate = new Date(schedule.start_time);
            return isSameDay(scheduleDate, day);
          });
          
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={index}
              className={cn(
                "flex flex-col items-center p-2 rounded-lg cursor-pointer transition-colors",
                isSelected ? "bg-blue-100" : "hover:bg-gray-100",
                isToday && "border-blue-500 border-2",
                isDraggingOver === index && "bg-blue-50 border-dashed border-2 border-blue-400",
                hasSchedule && !isSelected && "bg-gray-50"
              )}
              onClick={() => handleDayClick(day)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="text-sm font-medium">{format(day, 'EEE')}</div>
              <div className={cn(
                "flex items-center justify-center h-8 w-8 rounded-full",
                isSelected ? "bg-blue-500 text-white" : "text-gray-700"
              )}>
                {format(day, 'd')}
              </div>
              {hasSchedule && (
                <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mt-1"></div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Day schedules */}
      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-3">
          {selectedDay ? format(selectedDay, 'EEEE, MMMM d, yyyy') : 'Select a day'}
        </h3>
        
        <div className="space-y-2">
          {daySchedules.length > 0 ? (
            daySchedules.map(schedule => (
              <div 
                key={schedule.id}
                className={cn(
                  "p-3 border rounded-lg",
                  highlightedShiftId === schedule.id ? "border-green-500 bg-green-50" : "border-gray-200",
                  schedule.status === 'pending' ? "bg-amber-50" : ""
                )}
              >
                <div className="flex justify-between">
                  <div className="font-medium">{schedule.title}</div>
                  <div className="text-sm text-gray-600">
                    {format(new Date(schedule.start_time), 'h:mm a')} - {format(new Date(schedule.end_time), 'h:mm a')}
                  </div>
                </div>
                
                {schedule.location && (
                  <div className="text-sm text-gray-500 mt-1">Location: {schedule.location}</div>
                )}
                
                {schedule.status && (
                  <div className={cn(
                    "text-xs px-2 py-0.5 rounded-full inline-block mt-2",
                    schedule.status === 'confirmed' ? "bg-green-100 text-green-800" : 
                    schedule.status === 'pending' ? "bg-amber-100 text-amber-800" : 
                    "bg-gray-100 text-gray-800"
                  )}>
                    {schedule.status}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">
              No shifts scheduled for this day
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeeklyCalendarView;
