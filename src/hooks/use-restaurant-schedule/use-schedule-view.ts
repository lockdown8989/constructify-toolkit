
import { useState } from 'react';
import { ViewMode } from '@/types/restaurant-schedule';

export const useScheduleView = (initialWeekNumber: number = 17, initialViewMode: ViewMode = 'week') => {
  const [weekNumber, setWeekNumber] = useState<number>(initialWeekNumber);
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);

  // Function to toggle between week and month views
  const toggleViewMode = () => {
    setViewMode(prevMode => prevMode === 'week' ? 'month' : 'week');
  };

  // Function to navigate to the previous week
  const previousWeek = () => {
    setWeekNumber(prev => prev - 1);
  };

  // Function to navigate to the next week
  const nextWeek = () => {
    setWeekNumber(prev => prev + 1);
  };

  return {
    weekNumber,
    viewMode,
    toggleViewMode,
    previousWeek,
    nextWeek,
    setViewMode
  };
};
