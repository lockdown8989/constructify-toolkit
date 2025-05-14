
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
import { Loader2, Calendar, LayoutGrid, AlertCircle } from 'lucide-react';
import { toast as sonnerToast } from 'sonner';
import { OpenShiftType } from '@/types/supabase/schedules';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import EmployeeList from '@/components/restaurant/EmployeeList';

const RestaurantSchedule = () => {
  const [syncingData, setSyncingData] = useState(false);
  const [locationName, setLocationName] = useState("Main Restaurant");
  const [showEmployeePanel, setShowEmployeePanel] = useState(true);
  
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
  
  const toggleEmployeePanel = () => {
    setShowEmployeePanel(!showEmployeePanel);
  };
  
  if (isLoadingEmployeeData) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-lg text-gray-700">Loading schedule data...</span>
        <p className="text-sm text-gray-500">Please wait while we retrieve the latest information</p>
      </div>
    );
  }
  
  return (
    <div className="container py-6 sm:py-8 max-w-[1400px] px-3 md:px-6 mx-auto">
      <div className="mb-4 sm:mb-6">
        <ScheduleHeader 
          locationName={locationName}  
          setLocationName={setLocationName}  
          setViewMode={setViewMode} 
          onSyncCalendar={syncWithCalendar}
          onSyncEmployeeData={syncEmployeeData}
          isSyncing={syncingData}
        />
      </div>
      
      <div className="flex justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleEmployeePanel}
            className="flex items-center gap-2"
          >
            {showEmployeePanel ? "Hide" : "Show"} Employees
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
        <OpenShiftActions addOpenShift={addOpenShift} />
      </div>
      
      {employees.length === 0 && !isLoadingEmployeeData ? (
        <Card className="p-8 text-center mb-6">
          <div className="flex flex-col items-center gap-2">
            <AlertCircle className="h-10 w-10 text-amber-500" />
            <h3 className="text-lg font-semibold mt-2">No Employees Found</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-4">
              There are no employees available to schedule. Add employees to get started with scheduling.
            </p>
            <Button variant="default">Add Employees</Button>
          </div>
        </Card>
      ) : (
        <div className={`grid ${showEmployeePanel ? 'grid-cols-1 lg:grid-cols-[320px_1fr]' : 'grid-cols-1'} gap-4 mb-6`}>
          {/* Employee list panel */}
          {showEmployeePanel && !isMobile && (
            <Card className="overflow-hidden h-fit bg-white rounded-xl shadow-sm">
              <EmployeeList employees={employees} />
            </Card>
          )}
          
          {/* Schedule grid */}
          <Card className="overflow-hidden bg-white rounded-xl shadow-sm border border-gray-100">
            <WeeklyGrid 
              weekStats={weekStats}
              openShifts={openShifts as OpenShiftType[]} 
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
          </Card>
        </div>
      )}
      
      {/* Role sections */}
      <div className="space-y-4 sm:space-y-5">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Weekly Schedule by Role
        </h2>
        
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
