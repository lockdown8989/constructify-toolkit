
import { useState } from 'react';
import { addDays, subDays } from 'date-fns';
import { useToast } from './use-toast';
import { 
  getWeekDays,
  getTimeSlots,
  formatEventTime,
  getEventsForDay,
  getVisibleEvents
} from '@/components/employee-calendar/utils/calendar-utils';

export function useEmployeeCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('week');
  const [searchQuery, setSearchQuery] = useState('');
  
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
  
  const weekDays = getWeekDays(currentDate);
  const timeSlots = getTimeSlots();
  const visibleEvents = getVisibleEvents(events, currentDate, viewMode);
  
  return {
    currentDate,
    setCurrentDate,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    events,
    weekDays,
    timeSlots,
    visibleEvents,
    handlePrevious,
    handleNext,
    handleToday,
    handleAddEvent,
    getEventsForDay: (day: Date) => getEventsForDay(events, day),
    formatEventTime
  };
}
