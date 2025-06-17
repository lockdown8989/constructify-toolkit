
import { useState, useMemo } from 'react';

export const useWeekNavigation = () => {
  const [weekOffset, setWeekOffset] = useState(0);

  const currentWeek = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + weekOffset * 7);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    return {
      start: startOfWeek,
      end: endOfWeek,
      weekOffset
    };
  }, [weekOffset]);

  const weekStats = useMemo(() => {
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    };

    return {
      weekRange: `${formatDate(currentWeek.start)} - ${formatDate(currentWeek.end)}`,
      totalHours: 0,
      totalCost: 0,
      dailyHours: {
        monday: 0,
        tuesday: 0,
        wednesday: 0,
        thursday: 0,
        friday: 0,
        saturday: 0,
        sunday: 0
      },
      dailyCosts: {
        monday: 0,
        tuesday: 0,
        wednesday: 0,
        thursday: 0,
        friday: 0,
        saturday: 0,
        sunday: 0
      },
      roles: []
    };
  }, [currentWeek]);

  const previousWeek = () => {
    setWeekOffset(prev => prev - 1);
  };

  const nextWeek = () => {
    setWeekOffset(prev => prev + 1);
  };

  return {
    currentWeek,
    weekStats,
    previousWeek,
    nextWeek
  };
};
