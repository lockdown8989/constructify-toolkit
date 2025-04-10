
import { useState } from 'react';
import { useShiftManagement } from './use-shift-management';
import { useScheduleView } from './use-schedule-view';
import { useScheduleStats } from './use-schedule-stats';
import { Employee, ViewMode } from '@/types/restaurant-schedule';

// Sample data for the restaurant schedule with a few employees
const SAMPLE_EMPLOYEES: Employee[] = [
  { id: '1', name: 'Eleanor Pena', role: 'Kitchen Manager', avatarUrl: '/placeholder.svg', hourlyRate: 18.50 },
  { id: '2', name: 'John Lane', role: 'Head Chef', avatarUrl: '/placeholder.svg', hourlyRate: 22.00 },
  { id: '3', name: 'Leslie Alexander', role: 'Chef', avatarUrl: '/placeholder.svg', hourlyRate: 16.75 },
  { id: '4', name: 'Ronald Richards', role: 'Waiting Staff', avatarUrl: '/placeholder.svg', hourlyRate: 12.50 },
];

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
