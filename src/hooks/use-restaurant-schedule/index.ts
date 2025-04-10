
import { useState } from 'react';
import { useShiftManagement } from './use-shift-management';
import { useScheduleView } from './use-schedule-view';
import { useScheduleStats } from './use-schedule-stats';
import { ViewMode, Employee } from '@/types/restaurant-schedule';
import { useEmployees } from '@/hooks/use-employees';

// Adapter function to convert database employees to restaurant schedule employees
const adaptEmployees = (dbEmployees: any[]): Employee[] => {
  return dbEmployees.map(employee => ({
    id: employee.id,
    name: employee.name,
    role: employee.job_title || employee.department || 'Staff', // Use job_title or department as role
    hourlyRate: employee.salary ? employee.salary / 2080 : 15, // Convert annual salary to hourly (2080 = 40 hours * 52 weeks)
    avatarUrl: employee.avatar || undefined
  }));
};

export const useRestaurantSchedule = (initialWeekNumber: number = 17, initialViewMode: ViewMode = 'week') => {
  // Fetch real employees from the system
  const { data: dbEmployees = [] } = useEmployees({});
  
  // Convert database employees to the expected format
  const employees = adaptEmployees(dbEmployees);
  
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
