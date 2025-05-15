
import React, { useState } from 'react';
import { addDays, format, isToday, startOfWeek } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { useEmployeeSchedule } from '@/hooks/use-employee-schedule';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const EmployeeCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');
  const { schedules, isLoading } = useEmployeeSchedule();
  const isMobile = useIsMobile();
  
  // Get week days starting from current date
  const getWeekDays = () => {
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));
  };
  
  const weekDays = getWeekDays();
  
  // Handle navigation
  const previousPeriod = () => {
    if (view === 'month') {
      const prevMonth = new Date(currentDate);
      prevMonth.setMonth(prevMonth.getMonth() - 1);
      setCurrentDate(prevMonth);
    } else {
      setCurrentDate(addDays(currentDate, -7));
    }
  };
  
  const nextPeriod = () => {
    if (view === 'month') {
      const nextMonth = new Date(currentDate);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      setCurrentDate(nextMonth);
    } else {
      setCurrentDate(addDays(currentDate, 7));
    }
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  // Get events for a specific day
  const getEventsForDay = (day: Date) => {
    if (!schedules) return [];
    
    const dayStr = format(day, 'yyyy-MM-dd');
    return schedules.filter(schedule => {
      const scheduleDate = schedule.start_time.split('T')[0];
      return scheduleDate === dayStr;
    });
  };
  
  return (
    <div className="container py-6">
      <Card className="border rounded-xl shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <CalendarIcon className="mr-2 h-5 w-5 text-primary" />
              My Calendar
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={previousPeriod}
                className="h-8 w-8 p-0 rounded-full"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
                className="h-8"
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={nextPeriod}
                className="h-8 w-8 p-0 rounded-full"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-2">
            <div className="text-lg font-medium">
              {view === 'month'
                ? format(currentDate, 'MMMM yyyy')
                : `${format(weekDays[0], 'MMM d')} - ${format(weekDays[6], 'MMM d, yyyy')}`
              }
            </div>
            <div className="flex rounded-md border">
              <Button
                variant={view === 'month' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('month')}
                className="rounded-r-none"
              >
                Month
              </Button>
              <Button
                variant={view === 'week' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('week')}
                className="rounded-l-none"
              >
                Week
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {view === 'month' ? (
            <Calendar
              mode="single"
              selected={currentDate}
              onSelect={(date) => date && setCurrentDate(date)}
              className="w-full pointer-events-auto"
              classNames={{
                day_today: "bg-black text-white",
                day_selected: "bg-primary text-primary-foreground",
                cell: "text-center p-0 relative [&:has([aria-selected])]:bg-primary/10 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                head_cell: "text-gray-500 text-xs sm:text-sm w-9 font-normal",
                nav_button: "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100",
                caption: "text-sm sm:text-base",
              }}
              components={{
                DayContent: (props) => {
                  const day = props.date;
                  const events = getEventsForDay(day);
                  
                  return (
                    <div className="relative w-full h-full flex flex-col items-center justify-center">
                      <div>{day.getDate()}</div>
                      {events.length > 0 && (
                        <div className="absolute -bottom-1 flex justify-center w-full">
                          <div className="h-1.5 w-1.5 bg-blue-500 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  );
                }
              }}
            />
          ) : (
            <div className={`grid grid-cols-7 gap-1 mt-4 ${isMobile ? 'text-xs' : 'text-sm'}`}>
              {/* Weekday headers */}
              {weekDays.map((day, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "text-center font-medium py-2",
                    isToday(day) && "bg-primary/10 rounded-t-md"
                  )}
                >
                  <div>{format(day, 'EEE')}</div>
                  <div className={cn(
                    "text-lg mt-1",
                    isToday(day) && "bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto"
                  )}>
                    {format(day, 'd')}
                  </div>
                </div>
              ))}
              
              {/* Event cells for each day */}
              {weekDays.map((day, i) => {
                const events = getEventsForDay(day);
                
                return (
                  <div 
                    key={`cell-${i}`} 
                    className={cn(
                      "border-t h-24 overflow-auto p-1",
                      isToday(day) && "bg-primary/5"
                    )}
                  >
                    {events.map((event, j) => (
                      <div 
                        key={`event-${day}-${j}`}
                        className="text-xs bg-blue-100 text-blue-900 rounded px-2 py-1 mb-1 truncate border-l-2 border-blue-500"
                      >
                        {format(new Date(event.start_time), 'HH:mm')} - {event.title}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeCalendar;
