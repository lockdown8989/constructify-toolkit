
import React, { useState } from 'react';
import { format, addDays, subDays, addMonths, subMonths, startOfWeek, endOfWeek, isSameDay, parseISO } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

const EmployeeCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('week');
  const [searchQuery, setSearchQuery] = useState('');
  
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  // Mock events data - in a real app, this would come from an API
  const events = [
    {
      id: '1',
      title: 'Weekly Monday Meeting',
      start: new Date(2025, 4, 15, 9, 0), // May 15, 2025, 9:00 AM
      end: new Date(2025, 4, 15, 10, 0),
      color: '#68D391' // green
    },
    {
      id: '2',
      title: 'Morning Routine',
      start: new Date(2025, 4, 15, 6, 30), // May 15, 2025, 6:30 AM
      end: new Date(2025, 4, 15, 7, 30),
      color: '#F6AD55' // orange
    },
    {
      id: '3',
      title: 'Team Lunch',
      start: new Date(2025, 4, 16, 12, 0), // May 16, 2025, 12:00 PM
      end: new Date(2025, 4, 16, 13, 0),
      color: '#4299E1' // blue
    }
  ];

  // Handle navigation
  const handlePrevious = () => {
    if (viewMode === 'day') {
      setCurrentDate(prev => subDays(prev, 1));
    } else {
      setCurrentDate(prev => subDays(prev, 7));
    }
  };

  const handleNext = () => {
    if (viewMode === 'day') {
      setCurrentDate(prev => addDays(prev, 1));
    } else {
      setCurrentDate(prev => addDays(prev, 7));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };
  
  // Handle adding a new event
  const handleAddEvent = () => {
    toast({
      title: "Create new event",
      description: "This feature is coming soon!",
    });
  };

  // Get days for the weekly view
  const getWeekDays = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
    return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
  };
  
  // Get hours for the day
  const getHours = () => {
    return Array.from({ length: 24 }).map((_, i) => i);
  };
  
  // Check if an event is on a specific day
  const getEventsForDay = (day: Date) => {
    return events.filter(event => 
      isSameDay(event.start, day)
    );
  };
  
  // Get events for the current time range
  const getVisibleEvents = () => {
    if (viewMode === 'day') {
      return events.filter(event => 
        isSameDay(event.start, currentDate)
      );
    } else {
      const startDay = startOfWeek(currentDate, { weekStartsOn: 1 });
      const endDay = endOfWeek(currentDate, { weekStartsOn: 1 });
      
      return events.filter(event => 
        event.start >= startDay && event.start <= endDay
      );
    }
  };
  
  // Format event time
  const formatEventTime = (start: Date, end: Date) => {
    return `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`;
  };
  
  // Generate time slots
  const timeSlots = getHours().map(hour => ({
    hour,
    label: `${hour}:00`
  }));
  
  const weekDays = getWeekDays();
  const visibleEvents = getVisibleEvents();

  return (
    <div className={`${isMobile ? 'px-2 py-4' : 'container py-6'}`}>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden max-w-6xl mx-auto">
        {/* Calendar Header */}
        <div className="p-4 border-b flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center">
            <CalendarIcon className="mr-2 h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold">Employee Calendar</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {!isMobile && (
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search events..." 
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}
            
            <Button 
              variant={viewMode === 'day' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('day')}
              className="h-9"
            >
              Day
            </Button>
            
            <Button 
              variant={viewMode === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('week')}
              className="h-9"
            >
              Week
            </Button>
            
            <Button 
              variant="default"
              size="sm"
              className="bg-primary text-white h-9"
              onClick={handleAddEvent}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Event
            </Button>
          </div>
        </div>
        
        {/* Calendar Navigation */}
        <div className="flex justify-between items-center p-3 bg-gray-50 border-b">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrevious} className="h-8 w-8 p-0">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleToday} className="h-8">
              Today
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleNext} className="h-8 w-8 p-0">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="text-base font-medium">
            {viewMode === 'day' 
              ? format(currentDate, 'MMMM d, yyyy')
              : `${format(weekDays[0], 'MMM d')} - ${format(weekDays[6], 'MMM d, yyyy')}`
            }
          </div>
          
          <div className="w-20">
            {/* Spacer for flex alignment */}
          </div>
        </div>
        
        {/* Calendar Grid */}
        <div className={`overflow-auto ${isMobile ? 'momentum-scroll' : ''}`} style={{ height: 'calc(100vh - 220px)', minHeight: '500px' }}>
          <div className="min-width-fit-content">
            {/* Day Headers for Week View */}
            {viewMode === 'week' && (
              <div className="grid grid-cols-8 border-b">
                <div className="sticky left-0 bg-white z-10 w-16 border-r text-center py-2">
                  GMT+07
                </div>
                {weekDays.map((day, index) => (
                  <div 
                    key={index} 
                    className={`text-center py-3 ${isSameDay(day, new Date()) ? 'bg-blue-50' : ''}`}
                  >
                    <div className="text-gray-500 text-xs uppercase">{format(day, 'EEEE')}</div>
                    <div className="text-xl font-semibold">{format(day, 'dd')}</div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Time Grid */}
            <div className="relative">
              {/* Time Slots */}
              <div className={`grid ${viewMode === 'week' ? 'grid-cols-8' : 'grid-cols-2'}`}>
                {/* Time Labels */}
                <div className="sticky left-0 bg-white z-10">
                  {timeSlots.map((slot) => (
                    <div key={slot.hour} className="h-16 border-t border-r flex items-start justify-center text-xs text-gray-500 w-16">
                      {slot.hour > 0 && <span className="mt-1">{slot.label}</span>}
                    </div>
                  ))}
                </div>
                
                {/* Day Columns */}
                {viewMode === 'week' ? (
                  weekDays.map((day, dayIndex) => (
                    <div key={dayIndex} className="relative">
                      {timeSlots.map((slot) => (
                        <div key={slot.hour} className="h-16 border-t border-l first:border-l-0">
                          &nbsp;
                        </div>
                      ))}
                      
                      {/* Events for this day */}
                      {getEventsForDay(day).map((event, eventIndex) => {
                        // Calculate position based on event time
                        const startHour = event.start.getHours() + (event.start.getMinutes() / 60);
                        const endHour = event.end.getHours() + (event.end.getMinutes() / 60);
                        const duration = endHour - startHour;
                        
                        return (
                          <div
                            key={event.id}
                            className="absolute left-1 right-1 rounded overflow-hidden shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                            style={{
                              top: `${startHour * 4}rem`,
                              height: `${duration * 4}rem`,
                              backgroundColor: event.color,
                              borderLeft: `3px solid ${event.color}`,
                            }}
                            onClick={() => toast({ title: event.title, description: formatEventTime(event.start, event.end) })}
                          >
                            <div className="p-1 text-white">
                              <div className="text-xs">{formatEventTime(event.start, event.end)}</div>
                              <div className="font-medium text-sm">{event.title}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))
                ) : (
                  <div className="relative">
                    {timeSlots.map((slot) => (
                      <div key={slot.hour} className="h-16 border-t">
                        &nbsp;
                      </div>
                    ))}
                    
                    {/* Events for this day */}
                    {getEventsForDay(currentDate).map((event, eventIndex) => {
                      // Calculate position based on event time
                      const startHour = event.start.getHours() + (event.start.getMinutes() / 60);
                      const endHour = event.end.getHours() + (event.end.getMinutes() / 60);
                      const duration = endHour - startHour;
                      
                      return (
                        <div
                          key={event.id}
                          className="absolute left-1 right-1 rounded overflow-hidden shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                          style={{
                            top: `${startHour * 4}rem`,
                            height: `${duration * 4}rem`,
                            backgroundColor: event.color,
                            borderLeft: `3px solid ${event.color}`,
                          }}
                          onClick={() => toast({ title: event.title, description: formatEventTime(event.start, event.end) })}
                        >
                          <div className="p-2 text-white">
                            <div className="text-xs">{formatEventTime(event.start, event.end)}</div>
                            <div className="font-medium">{event.title}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeCalendar;
