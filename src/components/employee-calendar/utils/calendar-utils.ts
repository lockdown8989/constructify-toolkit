
import { format, addDays, subDays, startOfWeek, endOfWeek, isSameDay } from 'date-fns';

export const getWeekDays = (currentDate: Date) => {
  const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
  return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
};

export const getHours = () => {
  return Array.from({ length: 24 }).map((_, i) => i);
};

export const getTimeSlots = () => {
  return getHours().map(hour => ({
    hour,
    label: `${hour}:00`
  }));
};

export const formatEventTime = (start: Date, end: Date) => {
  return `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`;
};

export const getEventsForDay = (events: any[], day: Date) => {
  return events.filter(event => isSameDay(event.start, day));
};

export const getVisibleEvents = (events: any[], currentDate: Date, viewMode: 'day' | 'week') => {
  if (viewMode === 'day') {
    return events.filter(event => isSameDay(event.start, currentDate));
  } else {
    const startDay = startOfWeek(currentDate, { weekStartsOn: 1 });
    const endDay = endOfWeek(currentDate, { weekStartsOn: 1 });
    
    return events.filter(event => 
      event.start >= startDay && event.start <= endDay
    );
  }
};

export const handlePreviousDay = (currentDate: Date, setCurrentDate: (date: Date) => void) => {
  setCurrentDate(subDays(currentDate, 1));
};

export const handleNextDay = (currentDate: Date, setCurrentDate: (date: Date) => void) => {
  setCurrentDate(addDays(currentDate, 1));
};

export const handlePreviousWeek = (currentDate: Date, setCurrentDate: (date: Date) => void) => {
  setCurrentDate(subDays(currentDate, 7));
};

export const handleNextWeek = (currentDate: Date, setCurrentDate: (date: Date) => void) => {
  setCurrentDate(addDays(currentDate, 7));
};
