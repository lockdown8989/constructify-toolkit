
import React, { useState, useEffect, useRef } from 'react';
import { addDays, format, isToday, startOfWeek, addMonths, subMonths, isSameDay, isSameMonth } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { useEmployeeSchedule } from '@/hooks/use-employee-schedule';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useIsTouchDevice } from '@/hooks/use-mobile';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

const EmployeeCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');
  const { schedules, isLoading, refetch } = useEmployeeSchedule();
  const isMobile = useIsMobile();
  const isTouch = useIsTouchDevice();
  const touchStartX = useRef<number | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Set up refetch interval
    const interval = setInterval(() => {
      refetch();
    }, 5 * 60 * 1000); // Refresh every 5 minutes
    
    return () => clearInterval(interval);
  }, [refetch]);
  
  // Get week days starting from current date
  const getWeekDays = () => {
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));
  };
  
  const weekDays = getWeekDays();
  
  // Handle navigation
  const previousPeriod = () => {
    if (view === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, -7));
    }
  };
  
  const nextPeriod = () => {
    if (view === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, 7));
    }
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  // Touch event handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    
    // Swipe threshold - require at least 50px movement
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swipe left - go to next period
        nextPeriod();
      } else {
        // Swipe right - go to previous period
        previousPeriod();
      }
    }
    
    touchStartX.current = null;
  };
  
  // Get events for a specific day
  const getEventsForDay = (day: Date) => {
    if (!schedules || !schedules.length) return [];
    
    const dayStr = format(day, 'yyyy-MM-dd');
    return schedules.filter(schedule => {
      const scheduleDate = schedule.start_time.split('T')[0];
      return scheduleDate === dayStr;
    });
  };

  // Handle event click
  const handleEventClick = (eventId: string) => {
    console.log('Event clicked:', eventId);
    // Implement event details view or dialog
  };
  
  return (
    <div 
      className="container py-4 px-2 md:py-6 md:px-4"
      ref={calendarRef}
      onTouchStart={isTouch ? handleTouchStart : undefined}
      onTouchEnd={isTouch ? handleTouchEnd : undefined}
      style={{ WebkitOverflowScrolling: 'touch' }} // For iOS momentum scrolling
    >
      <Card className="border rounded-xl shadow-sm overflow-hidden">
        <CardHeader className={`${isMobile ? 'p-3' : 'pb-2 pt-4 px-4'} space-y-2`}>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center text-base md:text-lg">
              <CalendarIcon className="mr-2 h-5 w-5 text-primary" />
              My Calendar
            </CardTitle>
            <div className="flex space-x-1 md:space-x-2">
              <Button
                variant="outline"
                size={isMobile ? "icon" : "sm"}
                onClick={previousPeriod}
                className="h-8 w-8 p-0 rounded-full"
                aria-label="Previous period"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size={isMobile ? "sm" : "sm"}
                onClick={goToToday}
                className="h-8 touch-target"
              >
                Today
              </Button>
              <Button
                variant="outline"
                size={isMobile ? "icon" : "sm"}
                onClick={nextPeriod}
                className="h-8 w-8 p-0 rounded-full"
                aria-label="Next period"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-base font-medium truncate">
              {view === 'month'
                ? format(currentDate, 'MMMM yyyy')
                : `${format(weekDays[0], 'MMM d')} - ${format(weekDays[6], 'MMM d, yyyy')}`
              }
            </div>
            <div className="flex rounded-md border">
              <Button
                variant={view === 'month' ? 'default' : 'ghost'}
                size={isMobile ? "sm" : "default"}
                onClick={() => setView('month')}
                className={cn(
                  "rounded-r-none text-xs md:text-sm py-1 h-8 px-2 md:px-3",
                  view === 'month' ? "active-touch-state" : ""
                )}
              >
                Month
              </Button>
              <Button
                variant={view === 'week' ? 'default' : 'ghost'}
                size={isMobile ? "sm" : "default"}
                onClick={() => setView('week')}
                className={cn(
                  "rounded-l-none text-xs md:text-sm py-1 h-8 px-2 md:px-3",
                  view === 'week' ? "active-touch-state" : ""
                )}
              >
                Week
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className={`${isMobile ? 'p-0 md:p-4' : 'p-4'}`}>
          {isLoading ? (
            <div className="space-y-2 p-4">
              <Skeleton className="w-full h-8" />
              <Skeleton className="w-full h-36" />
              <Skeleton className="w-full h-36" />
            </div>
          ) : view === 'month' ? (
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
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  
                  return (
                    <div className={cn(
                      "relative w-full h-full flex flex-col items-center justify-center",
                      !isCurrentMonth && "opacity-40"
                    )}>
                      <div>{day.getDate()}</div>
                      {events.length > 0 && (
                        <div className="absolute -bottom-1 flex justify-center gap-0.5 w-full">
                          {events.length <= 2 ? (
                            events.map((_, i) => (
                              <div 
                                key={i}
                                className="h-1.5 w-1.5 bg-blue-500 rounded-full"
                              />
                            ))
                          ) : (
                            <>
                              <div className="h-1.5 w-1.5 bg-blue-500 rounded-full" />
                              <div className="h-1.5 w-1.5 bg-blue-500 rounded-full" />
                              <div className="h-1.5 w-1.5 bg-gray-400 rounded-full" />
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                }
              }}
            />
          ) : (
            <div className="flex flex-col">
              {/* Weekday headers */}
              <div className={`grid grid-cols-7 gap-1 ${isMobile ? 'mb-1' : 'mb-2'}`}>
                {weekDays.map((day, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "text-center font-medium py-2",
                      isToday(day) && "bg-primary/10 rounded-t-md"
                    )}
                  >
                    <div className={cn(
                      isMobile ? "text-xs" : "text-sm",
                      "text-gray-500"
                    )}>{format(day, 'EEE')}</div>
                    <div className={cn(
                      "mt-1",
                      isToday(day) && "bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center mx-auto"
                    )}>
                      {format(day, 'd')}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Event cells for each day */}
              <ScrollArea className={`h-[calc(100vh-240px)] ${isMobile ? 'min-h-[300px]' : 'min-h-[400px]'}`}>
                <div className="grid grid-cols-7 gap-1">
                  {weekDays.map((day, i) => {
                    const events = getEventsForDay(day);
                    
                    return (
                      <div 
                        key={`cell-${i}`} 
                        className={cn(
                          "border-t min-h-[90px] overflow-hidden p-1",
                          isToday(day) && "bg-primary/5"
                        )}
                      >
                        {events.length > 0 ? (
                          <div className="space-y-1">
                            {events.map((event) => (
                              <button
                                key={event.id}
                                className={cn(
                                  "w-full text-left text-xs bg-blue-100 text-blue-900 rounded px-1.5 py-1 truncate border-l-2 border-blue-500",
                                  "hover:bg-blue-200 active:bg-blue-300 transition-colors active-touch-state"
                                )}
                                onClick={() => handleEventClick(event.id)}
                              >
                                <div className="font-medium">
                                  {format(new Date(event.start_time), 'HH:mm')}
                                </div>
                                <div className="truncate">{event.title}</div>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center text-gray-400 text-[10px]">
                            {isMobile ? "" : "No events"}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          )}
          
          <div className="mt-2 pt-2 px-2 border-t">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Tap event for details</span>
              <span>{isLoading ? "Updating..." : "Pull down to refresh"}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeCalendar;
