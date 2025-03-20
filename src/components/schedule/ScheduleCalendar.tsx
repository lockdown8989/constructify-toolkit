
import React, { useState } from 'react';
import { format, startOfWeek, addDays, getHours, getMinutes, parse } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { useSchedules } from '@/hooks/use-schedules';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { type Schedule } from '@/hooks/use-schedules';

type ViewType = 'day' | 'week';

const ScheduleCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>('day');
  const { data: schedules = [] } = useSchedules(currentDate);

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

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

  const renderTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      slots.push(
        <div key={hour} className="flex border-t border-gray-200">
          <div className="w-16 pr-2 py-2 text-right text-sm text-gray-500">
            {hour}:00
          </div>
          <div className="flex-grow min-h-[60px] relative" />
        </div>
      );
    }
    return slots;
  };

  const getEventPosition = (schedule: Schedule) => {
    const startTime = new Date(schedule.start_time);
    const endTime = new Date(schedule.end_time);
    
    const startHour = getHours(startTime) + getMinutes(startTime) / 60;
    const endHour = getHours(endTime) + getMinutes(endTime) / 60;
    
    const top = (startHour - 9) * 60; // 9am is our starting hour
    const height = (endHour - startHour) * 60;
    
    return { top, height };
  };

  const renderDayView = () => {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const daySchedules = schedules.filter(schedule => 
      schedule.start_time.includes(dateStr)
    );

    return (
      <div className="mt-4 bg-white rounded-3xl p-6 card-shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-medium">
            {format(currentDate, 'EEEE, MMMM d, yyyy')}
          </h3>
        </div>
        
        <div className="relative mt-4">
          {renderTimeSlots()}
          
          {daySchedules.map(schedule => {
            const { top, height } = getEventPosition(schedule);
            return (
              <div
                key={schedule.id}
                className="absolute left-16 right-4 bg-blue-100 border-l-4 border-blue-500 rounded p-2 overflow-hidden"
                style={{ top: `${top}px`, height: `${height}px` }}
              >
                <div className="font-medium text-sm">{schedule.title}</div>
                <div className="text-xs flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
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
      <div className="mt-4 bg-white rounded-3xl p-6 card-shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-medium">
            Week of {format(startOfTheWeek, 'MMMM d, yyyy')}
          </h3>
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, index) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const daySchedules = schedules.filter(schedule => 
              schedule.start_time.includes(dateStr)
            );
            
            return (
              <div key={index} className="border rounded p-2">
                <div className="text-center font-medium mb-2">
                  {format(day, 'EEE')}
                  <br />
                  {format(day, 'd')}
                </div>
                
                <div className="space-y-2">
                  {daySchedules.map(schedule => (
                    <Card key={schedule.id} className="p-2 bg-blue-50 border-l-4 border-blue-500 text-xs">
                      <div className="font-medium">{schedule.title}</div>
                      <div className="flex items-center mt-1">
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
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handlePrevious}>
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={handleToday}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={handleNext}>
            Next
          </Button>
        </div>
        
        <div className="flex items-center bg-gray-100 rounded-md p-1">
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
