
import { useState } from 'react';
import { useShiftManagement } from './use-shift-management';
import { useScheduleView } from './use-schedule-view';
import { useScheduleStats } from './use-schedule-stats';
import { Employee, ViewMode } from '@/types/restaurant-schedule';

// Empty data for the restaurant schedule
const SAMPLE_EMPLOYEES: Employee[] = [];

export const useRestaurantSchedule = (initialWeekNumber: number = 17, initialViewMode: ViewMode = 'week') => {
  const [employees] = useState<Employee[]>(SAMPLE_EMPLOYEES);
  
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
