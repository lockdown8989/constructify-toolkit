
import { useMemo, useState } from 'react';
import { useRestaurantSchedule } from '@/hooks/use-restaurant-schedule';
import { useEmployeeDataManagement } from '@/hooks/use-employee-data-management';
import { useConflictHeatmap } from '@/hooks/use-conflict-heatmap';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useShiftUtilities } from '@/components/restaurant/ShiftUtilities';
import { formatCurrency } from '@/components/restaurant/utils/schedule-utils';
import { toast as sonnerToast } from 'sonner';
import { OpenShiftType } from '@/types/supabase/schedules';
import { OpenShift } from '@/types/restaurant-schedule';
import { format } from 'date-fns';

export const useRestaurantScheduleWithHeatmap = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDateDialogOpen, setIsDateDialogOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'week' | 'month' | 'list'>('week');
  
  const { 
    employees,
    shifts,
    openShifts,
    weekStats,
    addShift,
    updateShift,
    removeShift,
    addOpenShift,
    assignOpenShift,
    previousWeek,
    nextWeek,
    viewMode,
    setViewMode,
    isLoading: scheduleLoading
  } = useRestaurantSchedule();
  
  const { allEmployees, isLoading: isLoadingEmployeeData, error } = useEmployeeDataManagement();
  const { refetch: refetchHeatmap } = useConflictHeatmap();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { handleAddNote, handleAddBreak } = useShiftUtilities(updateShift);
  
  // Use the employees from the restaurant schedule hook, but fall back to raw data if needed
  const finalEmployees = employees && employees.length > 0 ? employees : [];
  
  // Enhanced addShift that triggers heatmap refresh
  const enhancedAddShift = async (shift: any) => {
    await addShift(shift);
    await refetchHeatmap();
  };

  // Enhanced updateShift that triggers heatmap refresh - fix the function signature
  const enhancedUpdateShift = async (updatedShift: any) => {
    await updateShift(updatedShift);
    await refetchHeatmap();
  };

  // Enhanced removeShift that triggers heatmap refresh
  const enhancedRemoveShift = async (id: string) => {
    await removeShift(id);
    await refetchHeatmap();
  };
  
  // Create a proper WeekStats object with all required properties
  const enhancedWeekStats = useMemo(() => {
    if (!weekStats) {
      return {
        weekRange: 'Current Week',
        startDate: new Date(),
        endDate: new Date(),
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
    }
    
    return {
      weekRange: weekStats.weekRange,
      startDate: weekStats.startDate,
      endDate: weekStats.endDate,
      totalHours: weekStats.totalHours,
      totalCost: weekStats.totalCost,
      dailyHours: weekStats.dailyHours,
      dailyCosts: weekStats.dailyCosts,
      roles: weekStats.roles,
      openShiftsTotalHours: weekStats.openShiftsTotalHours,
      openShiftsTotalCount: weekStats.openShiftsTotalCount
    };
  }, [weekStats]);
  
  // Handle assigning an open shift
  const handleAssignOpenShift = (openShiftId: string, employeeId?: string) => {
    if (employeeId) {
      // Direct assignment from drag and drop
      assignOpenShift(openShiftId, employeeId);
      
      sonnerToast.success("Shift assigned", {
        description: "The shift has been successfully assigned to the employee."
      });
    } else {
      // Show assignment dialog (future feature)
      toast({
        title: "Feature coming soon",
        description: "The ability to assign open shifts will be available soon.",
      });
    }
  };

  // Handle adding open shift - convert OpenShift to the expected type
  const handleAddOpenShift = (openShift: Partial<OpenShift>) => {
    // Convert OpenShift to OpenShiftType and add the required day property
    const startTime = openShift.start_time || openShift.startTime || `${new Date().toISOString().split('T')[0]}T09:00:00`;
    const dayName = format(new Date(startTime), 'EEEE').toLowerCase();
    
    const convertedOpenShift: Omit<OpenShift, 'id'> = {
      day: dayName, // Required property for OpenShift
      startTime: openShift.startTime || format(new Date(startTime), 'HH:mm'),
      endTime: openShift.endTime || format(new Date(openShift.end_time || openShift.endTime || `${new Date().toISOString().split('T')[0]}T17:00:00`), 'HH:mm'),
      title: openShift.title || 'Open Shift',
      role: openShift.role || '',
      notes: openShift.notes || '',
      priority: openShift.priority || 'normal',
      location: openShift.location || '',
      status: openShift.status || 'open',
      start_time: startTime,
      end_time: openShift.end_time || openShift.endTime || `${new Date().toISOString().split('T')[0]}T17:00:00`,
      expiration_date: openShift.expiration_date || '',
      created_platform: openShift.created_platform || 'desktop',
      last_modified_platform: openShift.last_modified_platform || 'desktop',
      mobile_notification_sent: openShift.mobile_notification_sent || false
    };
    
    addOpenShift(convertedOpenShift);
  };
  
  // Handle date click
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsDateDialogOpen(true);
  };

  // Handle view changes
  const handleViewChange = (view: 'week' | 'month' | 'list') => {
    setCurrentView(view);
  };

  return {
    // State
    selectedDate,
    isDateDialogOpen,
    setIsDateDialogOpen,
    currentView,
    handleViewChange,
    
    // Data
    finalEmployees,
    shifts,
    openShifts: openShifts as OpenShiftType[],
    enhancedWeekStats,
    
    // Loading states
    isLoading: isLoadingEmployeeData || scheduleLoading,
    error,
    
    // Utilities
    formatCurrency,
    isMobile,
    
    // Actions
    handleAssignOpenShift,
    handleAddOpenShift,
    handleDateClick,
    previousWeek,
    nextWeek,
    addShift: enhancedAddShift,
    updateShift: enhancedUpdateShift,
    removeShift: enhancedRemoveShift,
    handleAddNote,
    handleAddBreak
  };
};
