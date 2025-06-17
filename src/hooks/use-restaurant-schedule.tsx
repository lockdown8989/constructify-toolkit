
import { useState } from 'react';
import { useSchedules } from '@/hooks/use-schedules';
import { useEmployees } from '@/hooks/use-employees';
import { useWeekNavigation } from './use-restaurant-schedule/use-week-navigation';
import { useShiftManagement } from './use-restaurant-schedule/use-shift-management';
import { useDataTransformation } from './use-restaurant-schedule/use-data-transformation';
import { useDatabaseOperations } from './use-restaurant-schedule/use-database-operations';
import { useAutoRefresh } from './use-restaurant-schedule/use-auto-refresh';
import { ViewMode } from '@/types/restaurant-schedule';

export const useRestaurantSchedule = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('week');

  // Fetch real data from database
  const { data: schedulesData = [], isLoading: schedulesLoading, refetch: refetchSchedules } = useSchedules();
  const { data: employeesData = [], isLoading: employeesLoading } = useEmployees();

  // Week navigation
  const { currentWeek, previousWeek, nextWeek, weekStats } = useWeekNavigation();

  // Data transformation
  const { employees, shifts } = useDataTransformation(employeesData, schedulesData);

  // Shift management with local state
  const shiftManagement = useShiftManagement(employees);

  // Database operations
  const { addShift, updateShift, removeShift, isLoading: dbLoading } = useDatabaseOperations(refetchSchedules);

  // Enhanced updateShift that works with database
  const enhancedUpdateShift = async (updatedShift: any) => {
    await updateShift(updatedShift, schedulesData);
  };

  // Auto-refresh setup
  useAutoRefresh(schedulesLoading, employeesLoading, refetchSchedules);

  return {
    // Data
    employees,
    shifts,
    openShifts: shiftManagement.openShifts,
    
    // Loading states
    isLoading: schedulesLoading || employeesLoading || dbLoading,
    
    // Week navigation
    currentWeek,
    weekStats,
    previousWeek,
    nextWeek,
    
    // Shift management
    addShift,
    updateShift: enhancedUpdateShift,
    removeShift,
    addOpenShift: shiftManagement.addOpenShift,
    assignOpenShift: shiftManagement.assignOpenShift,
    
    // View management
    viewMode,
    setViewMode,
    
    // Refresh function
    refreshData: refetchSchedules
  };
};
