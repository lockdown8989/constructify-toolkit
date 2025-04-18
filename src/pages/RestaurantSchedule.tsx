
import { useMemo, useState } from 'react';
import { useRestaurantSchedule } from '@/hooks/use-restaurant-schedule';
import { Shift } from '@/types/restaurant-schedule';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useEmployeeDataManagement } from '@/hooks/use-employee-data-management';
import ScheduleHeader from '@/components/restaurant/ScheduleHeader';
import WeeklyGrid from '@/components/restaurant/WeeklyGrid';
import ShiftDialogManager from '@/components/restaurant/ShiftDialogManager';
import RolesSectionList from '@/components/restaurant/RolesSectionList';
import OpenShiftActions from '@/components/restaurant/OpenShiftActions';
import { useShiftUtilities } from '@/components/restaurant/ShiftUtilities';
import { days, formatCurrency } from '@/components/restaurant/utils/schedule-utils';
import { Loader2 } from 'lucide-react';
import { toast as sonnerToast } from 'sonner';

const RestaurantSchedule = () => {
  const [syncingData, setSyncingData] = useState(false);
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
    setViewMode,
    syncWithCalendar
  } = useRestaurantSchedule();
  
  const { employeeData, isLoading: isLoadingEmployeeData } = useEmployeeDataManagement();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { handleAddNote, handleAddBreak } = useShiftUtilities(updateShift);
  
  // Get the shift dialog manager with all its functions and component
  const shiftDialog = ShiftDialogManager({ addShift, updateShift });
  
  const syncEmployeeData = () => {
    if (syncingData) return; // Prevent multiple clicks
    
    setSyncingData(true);
    
    // Show syncing toast
    sonnerToast.loading("Synchronizing employee data...");
    
    // Simulate API call for data synchronization
    setTimeout(() => {
      setSyncingData(false);
      sonnerToast.success("Employee data synchronized");
      
      toast({
        title: "Synchronization complete",
        description: "All employee information has been updated.",
      });
    }, 1500);
  };
  
  // Organize shifts by employee and day for the role sections
  const organizedShifts = useMemo(() => {
    const result: Record<string, Record<string, Shift[]>> = {};
    
    // Initialize the structure
    employees.forEach(employee => {
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
  }, [employees, shifts]);
  
  // Handle assigning an open shift
  const handleAssignOpenShift = (openShiftId: string, employeeId?: string) => {
    if (employeeId) {
      // Direct assignment from drag and drop
      assignOpenShift(openShiftId, employeeId);
    } else {
      // Show assignment dialog (future feature)
      toast({
        title: "Feature coming soon",
        description: "The ability to assign open shifts will be available soon.",
      });
    }
  };
  
  if (isLoadingEmployeeData) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading schedule data...</span>
      </div>
    );
  }
  
  return (
    <div className="container py-6 sm:py-8 max-w-[1400px] px-3 md:px-6 mx-auto">
      <div className="mb-4 sm:mb-6">
        <ScheduleHeader 
          setViewMode={setViewMode} 
          onSyncCalendar={syncWithCalendar}
          onSyncEmployeeData={syncEmployeeData}
          isSyncing={syncingData}
        />
      </div>
      
      <div className="flex justify-end mb-3 sm:mb-4">
        <OpenShiftActions addOpenShift={addOpenShift} />
      </div>
      
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6 sm:mb-8">
        <WeeklyGrid 
          weekStats={weekStats}
          openShifts={openShifts}
          employees={employees}
          daysDisplayNames={isMobile 
            ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] 
            : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']}
          formatCurrency={formatCurrency}
          handleAssignOpenShift={handleAssignOpenShift}
          previousWeek={previousWeek}
          nextWeek={nextWeek}
          isMobile={isMobile}
        />
      </div>
      
      {/* Role sections */}
      <div className="space-y-4 sm:space-y-5">
        <RolesSectionList
          roles={weekStats.roles}
          organizedShifts={organizedShifts}
          onEditShift={shiftDialog.handleEditShift}
          onDeleteShift={removeShift}
          onAddShift={shiftDialog.handleAddShift}
          onAddNote={(shiftId) => handleAddNote(shiftId, shifts)}
          onAddBreak={(shiftId) => handleAddBreak(shiftId, shifts)}
          isMobile={isMobile}
        />
      </div>
      
      {/* Shift edit dialog */}
      {shiftDialog.ShiftDialogComponent}
    </div>
  );
};

export default RestaurantSchedule;
