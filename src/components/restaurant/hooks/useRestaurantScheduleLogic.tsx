import { useMemo, useState } from 'react';
import { useRestaurantSchedule } from '@/hooks/use-restaurant-schedule';
import { useEmployeeDataManagement } from '@/hooks/use-employee-data-management';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useShiftUtilities } from '@/components/restaurant/ShiftUtilities';
import { formatCurrency } from '@/components/restaurant/utils/schedule-utils';
import { toast as sonnerToast } from 'sonner';
import { OpenShiftType } from '@/types/supabase/schedules';
import { OpenShift } from '@/types/restaurant-schedule';

export const useRestaurantScheduleLogic = () => {
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
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { handleAddNote, handleAddBreak } = useShiftUtilities(updateShift);
  
  // Use the employees from the restaurant schedule hook, but fall back to raw data if needed
  const finalEmployees = employees && employees.length > 0 ? employees : [];
  
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
  
  // Organize shifts by employee and day for the role sections
  const organizedShifts = useMemo(() => {
    const result: Record<string, Record<string, any[]>> = {};
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    // Initialize the structure
    finalEmployees.forEach(employee => {
      result[employee.id] = {};
      days.forEach(day => {
        result[employee.id][day] = [];
      });
    });
    
    // Populate with shifts
    shifts.forEach(shift => {
      if (result[shift.employeeId] && result[shift.employeeId][shift.day]) {
        result[shift.employeeId][shift.day].push(shift);
      }
    });
    
    return result;
  }, [finalEmployees, shifts]);
  
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

  // Handle adding open shift - fix the type issue by ensuring all required properties
  const handleAddOpenShift = (openShift: Partial<OpenShift>) => {
    // Create a proper OpenShiftType with all required fields
    const convertedOpenShift: Omit<OpenShiftType, 'id'> = {
      title: openShift.title || 'Open Shift',
      role: openShift.role || null,
      start_time: openShift.start_time || openShift.startTime || `${new Date().toISOString().split('T')[0]}T09:00:00`,
      end_time: openShift.end_time || openShift.endTime || `${new Date().toISOString().split('T')[0]}T17:00:00`,
      location: openShift.location || '',
      notes: openShift.notes || '',
      status: openShift.status || 'open',
      priority: openShift.priority || 'normal',
      expiration_date: openShift.expiration_date || null,
      created_platform: openShift.created_platform || 'desktop',
      last_modified_platform: openShift.last_modified_platform || 'desktop',
      mobile_notification_sent: openShift.mobile_notification_sent || false,
      drag_disabled: false,
      mobile_friendly_view: null,
      created_by: null,
      created_at: new Date().toISOString(),
      notification_sent: false,
      position_order: null,
      auto_assign: false,
      applications_count: 0,
      last_dragged_by: null,
      last_dragged_at: null,
      department: null,
      minimum_experience: null
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
    organizedShifts,
    
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
    addShift,
    updateShift,
    removeShift,
    handleAddNote,
    handleAddBreak
  };
};
