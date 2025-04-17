
import React, { useState, useMemo, useEffect } from 'react';
import { format, startOfWeek, addDays, getHours, getMinutes, isToday } from 'date-fns';
import { useSchedules } from '@/hooks/use-schedules';
import { type Schedule } from '@/hooks/use-schedules';
import { cn } from '@/lib/utils';
import { ViewType } from './types/calendar-types';
import CalendarHeader from './components/CalendarHeader';
import DayView from './components/DayView';
import WeekView from './components/WeekView';

const ScheduleCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>('day');
  const { data: schedules = [] } = useSchedules();
  const [currentTimeTop, setCurrentTimeTop] = useState<number>(0);

  // Calculate current time position for the indicator
  useEffect(() => {
    const calculateTimePosition = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      
      // Only show time indicator during work hours (9am-5pm)
      if (hours >= 9 && hours <= 17) {
        const timePosition = (hours - 9) * 60 + minutes;
        setCurrentTimeTop(timePosition);
      } else {
        setCurrentTimeTop(-1); // Hide indicator outside work hours
      }
    };

    calculateTimePosition();
    const interval = setInterval(calculateTimePosition, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  const handlePrevious = () => {
    if (view === 'day') {
      setCurrentDate(prev => addDays(prev, -1));
    } else {
      setCurrentDate(prev => addDays(prev, -7));
    }
  };

  const handleNext = () => {
    if (view === 'day') {
      setCurrentDate(prev => addDays(prev, 1));
    } else {
      setCurrentDate(prev => addDays(prev, 7));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      const formattedHour = hour > 12 ? `${hour - 12}:00 ${hour >= 12 ? 'PM' : 'AM'}` : `${hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
      slots.push(
        <div key={hour} className="flex border-t border-gray-200/70">
          <div className="w-16 pr-2 py-2 text-right text-xs text-gray-500 font-medium">
            {formattedHour}
          </div>
          <div className="flex-grow min-h-[60px] relative" />
        </div>
      );
    }
    return slots;
  }, []);

  const getEventPosition = (schedule: Schedule) => {
    const startTime = new Date(schedule.start_time);
    const endTime = new Date(schedule.end_time);
    
    const startHour = getHours(startTime) + getMinutes(startTime) / 60;
    const endHour = getHours(endTime) + getMinutes(endTime) / 60;
    
    const top = (startHour - 9) * 60; // 9am is our starting hour
    const height = (endHour - startHour) * 60;
    
    return { top, height };
  };

  const getEventColor = (index: number) => {
    const colors = [
      'bg-blue-100/80 border-blue-500 hover:bg-blue-200/80',
      'bg-purple-100/80 border-purple-500 hover:bg-purple-200/80',
      'bg-green-100/80 border-green-500 hover:bg-green-200/80',
      'bg-amber-100/80 border-amber-500 hover:bg-amber-200/80',
      'bg-pink-100/80 border-pink-500 hover:bg-pink-200/80',
    ];
    
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-4">
      <CalendarHeader 
        currentDate={currentDate}
        view={view}
        setView={setView}
        handlePrevious={handlePrevious}
        handleNext={handleNext}
        handleToday={handleToday}
        isToday={isToday(currentDate)}
      />
      
      {view === 'day' ? (
        <DayView
          currentDate={currentDate}
          schedules={schedules}
          timeSlots={timeSlots}
          currentTimeTop={currentTimeTop}
          getEventPosition={getEventPosition}
          getEventColor={getEventColor}
        />
      ) : (
        <WeekView 
          currentDate={currentDate}
          schedules={schedules}
          getEventColor={getEventColor}
        />
      )}
    </div>
  );
};

export default ScheduleCalendar;
