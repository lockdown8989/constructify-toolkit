
import { useState } from 'react';
import { useShiftManagement } from './use-shift-management';
import { useScheduleView } from './use-schedule-view';
import { useScheduleStats } from './use-schedule-stats';
import { ViewMode } from '@/types/restaurant-schedule';
import { useEmployees } from '@/hooks/use-employees';

export const useRestaurantSchedule = (initialWeekNumber: number = 17, initialViewMode: ViewMode = 'week') => {
  // Fetch real employees from the system
  const { data: employees = [] } = useEmployees({});
  
  // Use our extracted hooks
  const scheduleView = useScheduleView(initialWeekNumber, initialViewMode);
  const shiftManagement = useShiftManagement(employees);
  const { weekStats } = useScheduleStats(
    employees, 
    shiftManagement.shifts, 
    shiftManagement.openShifts, 
    scheduleView.weekNumber
  );

  return {
    employees,
    ...shiftManagement,
    weekStats,
    ...scheduleView
  };
};
