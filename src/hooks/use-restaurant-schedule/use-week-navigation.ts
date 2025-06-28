
import { useState, useMemo } from 'react';
import { WeekStats } from '@/types/restaurant-schedule';
import { startOfWeek, endOfWeek, addWeeks, subWeeks, format } from 'date-fns';

export const useWeekNavigation = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const weekStats = useMemo((): WeekStats => {
    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
    
    return {
      weekRange: `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`,
      startDate: weekStart,
      endDate: weekEnd,
      totalHours: 0,
      totalCost: 0,
      dailyHours: {
        monday: 0, tuesday: 0, wednesday: 0, thursday: 0, 
        friday: 0, saturday: 0, sunday: 0
      },
      dailyCosts: {
        monday: 0, tuesday: 0, wednesday: 0, thursday: 0, 
        friday: 0, saturday: 0, sunday: 0
      },
      roles: [],
      openShiftsTotalHours: 0,
      openShiftsTotalCount: 0
    };
  }, [currentWeek]);

  const previousWeek = () => {
    setCurrentWeek(prev => subWeeks(prev, 1));
  };

  const nextWeek = () => {
    setCurrentWeek(prev => addWeeks(prev, 1));
  };

  return {
    currentWeek,
    weekStats,
    previousWeek,
    nextWeek
  };
};
