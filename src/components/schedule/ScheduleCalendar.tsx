import React, { useState, useMemo, useEffect } from 'react';
import { format, startOfWeek, addDays, getHours, getMinutes, isSameDay, isToday } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { useSchedules } from '@/hooks/use-schedules';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { type Schedule } from '@/hooks/use-schedules';
import { cn } from '@/lib/utils';

type ViewType = 'day' | 'week';

const ScheduleCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>('day');
  const { data: schedules = [] } = useSchedules();
  const [currentTimeTop, setCurrentTimeTop] = useState<number>(0);

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

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
        <div key={hour} className="flex border-t border-gray-200">
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
      'bg-blue-100 border-blue-500 hover:bg-blue-200',
      'bg-purple-100 border-purple-500 hover:bg-purple-200',
      'bg-green-100 border-green-500 hover:bg-green-200',
      'bg-amber-100 border-amber-500 hover:bg-amber-200',
      'bg-pink-100 border-pink-500 hover:bg-pink-200',
    ];
    
    return colors[index % colors.length];
  };

  const renderDayView = () => {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const daySchedules = schedules.filter(schedule => 
      schedule.start_time.includes(dateStr)
    );

    return (
      <div className="bg-white rounded-3xl p-6 card-shadow">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">
            {format(currentDate, 'EEEE, MMMM d, yyyy')}
          </h3>
          <div className="bg-gray-50 rounded-lg px-2 py-1 text-sm text-gray-500 flex items-center">
            <Clock className="h-3.5 w-3.5 mr-1 text-blue-500" />
            {isToday(currentDate) ? 'Today' : ''}
          </div>
        </div>
        
        <div className="relative mt-4 border border-gray-100 rounded-xl overflow-hidden">
          {timeSlots}
          
          {/* Current time indicator */}
          {isToday(currentDate) && currentTimeTop >= 0 && (
            <div 
              className="absolute left-0 right-0 flex items-center pointer-events-none z-10" 
              style={{ top: `${currentTimeTop}px` }}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 ml-14 mr-1"></div>
              <div className="flex-1 h-[2px] bg-red-500"></div>
            </div>
          )}
          
          {daySchedules.map((schedule, index) => {
            const { top, height } = getEventPosition(schedule);
            return (
              <div
                key={schedule.id}
                className={cn(
                  "absolute left-16 right-4 border-l-4 rounded p-2 overflow-hidden shadow-sm transition-all duration-150",
                  getEventColor(index)
                )}
                style={{ top: `${top}px`, height: `${height}px` }}
              >
                <div className="font-medium text-sm">{schedule.title}</div>
                <div className="text-xs flex items-center text-gray-600">
                  <Clock className="h-3 w-3 mr-1 inline" />
                  {formatInTimeZone(new Date(schedule.start_time), timeZone, 'h:mm a')} - 
                  {formatInTimeZone(new Date(schedule.end_time), timeZone, 'h:mm a')}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const startOfTheWeek = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfTheWeek, i));
    
    return (
      <div className="bg-white rounded-3xl p-6 card-shadow">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">
            Week of {format(startOfTheWeek, 'MMMM d, yyyy')}
          </h3>
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, index) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const daySchedules = schedules.filter(schedule => 
              schedule.start_time.includes(dateStr)
            );
            const isCurrentDay = isToday(day);
            
            return (
              <div 
                key={index} 
                className={cn(
                  "border rounded-xl p-2 min-h-[150px]",
                  isCurrentDay ? "bg-blue-50 border-blue-200" : "bg-white border-gray-100"
                )}
              >
                <div className={cn(
                  "text-center font-medium mb-3 p-1 rounded-lg",
                  isCurrentDay ? "bg-blue-500 text-white" : "text-gray-700"
                )}>
                  <div className="text-xs uppercase tracking-wide">
                    {format(day, 'EEE')}
                  </div>
                  <div className="text-lg font-bold">
                    {format(day, 'd')}
                  </div>
                </div>
                
                <div className="space-y-2">
                  {daySchedules.length === 0 && (
                    <div className="text-xs text-gray-400 text-center py-2">No events</div>
                  )}
                  
                  {daySchedules.map((schedule, idx) => (
                    <Card 
                      key={schedule.id} 
                      className={cn(
                        "p-2 border-l-4 text-xs hover:shadow-md transition-shadow duration-200",
                        getEventColor(idx)
                      )}
                    >
                      <div className="font-medium truncate">{schedule.title}</div>
                      <div className="flex items-center mt-1 text-gray-600">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatInTimeZone(new Date(schedule.start_time), timeZone, 'h:mm a')}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handlePrevious} className="rounded-full w-9 h-9 p-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleToday} className="font-medium">
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={handleNext} className="rounded-full w-9 h-9 p-0">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <Button 
            variant={view === 'day' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setView('day')}
            className="rounded-md"
          >
            Day
          </Button>
          <Button 
            variant={view === 'week' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setView('week')}
            className="rounded-md"
          >
            Week
          </Button>
        </div>
      </div>
      
      {view === 'day' ? renderDayView() : renderWeekView()}
    </div>
  );
};

export default ScheduleCalendar;
