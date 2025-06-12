
import { useMemo, useState, useCallback } from 'react';
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
  const [locationName, setLocationName] = useState("Main Location");
  const [showEmployeePanel, setShowEmployeePanel] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
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
  
  // Filter employees based on search query and location
  const filteredEmployees = useMemo(() => {
    let filtered = employees;
    
    // Filter by location - check if employee has location property and filter accordingly
    filtered = filtered.filter(employee => {
      const employeeLocation = (employee as any).location;
      return !employeeLocation || employeeLocation === locationName;
    });
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(employee => {
        const employeeLocation = (employee as any).location;
        return employee.name.toLowerCase().includes(query) ||
               employee.role.toLowerCase().includes(query) ||
               (employeeLocation && employeeLocation.toLowerCase().includes(query));
      });
    }
    
    return filtered;
  }, [employees, searchQuery, locationName]);

  // Create a callback to handle successful shift creation
  const handleShiftCreated = useCallback(() => {
    // Force a refresh of the schedule data
    syncWithCalendar();
    
    toast({
      title: "Shift created successfully",
      description: "The shift has been added to the schedule.",
    });
  }, [syncWithCalendar, toast]);
  
  // Get the shift dialog manager with all its functions and component
  const shiftDialog = ShiftDialogManager({ 
    addShift, 
    updateShift, 
    onResponseComplete: handleShiftCreated 
  });
  
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
  
  // Organize shifts by employee and day for the role sections (use filtered employees)
  const organizedShifts = useMemo(() => {
    const result: Record<string, Record<string, Shift[]>> = {};
    
    // Initialize the structure with filtered employees
    filteredEmployees.forEach(employee => {
      result[employee.id] = {};
      days.forEach(day => {
        result[employee.id][day] = [];
      });
    });
    
    // Populate with shifts (only for filtered employees)
    shifts.forEach(shift => {
      if (result[shift.employeeId] && result[shift.employeeId][shift.day]) {
        result[shift.employeeId][shift.day].push(shift);
      }
    });
    
    return result;
  }, [filteredEmployees, shifts]);
  
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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
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
          onSearch={handleSearch}
          searchQuery={searchQuery}
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
          {searchQuery && (
            <div className="text-sm text-gray-600">
              Showing {filteredEmployees.length} of {employees.length} employees
            </div>
          )}
        </div>
        <OpenShiftActions addOpenShift={addOpenShift} />
      </div>
      
      {filteredEmployees.length === 0 && !isLoadingEmployeeData ? (
        <Card className="p-8 text-center mb-6">
          <div className="flex flex-col items-center gap-2">
            <AlertCircle className="h-10 w-10 text-amber-500" />
            <h3 className="text-lg font-semibold mt-2">
              {searchQuery ? "No employees found" : "No Employees Found"}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-4">
              {searchQuery 
                ? `No employees match "${searchQuery}" at ${locationName}. Try adjusting your search.`
                : "There are no employees available to schedule. Add employees to get started with scheduling."
              }
            </p>
            {searchQuery && (
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear Search
              </Button>
            )}
            {!searchQuery && (
              <Button variant="default">Add Employees</Button>
            )}
          </div>
        </Card>
      ) : (
        <div className={`grid ${showEmployeePanel ? 'grid-cols-1 lg:grid-cols-[320px_1fr]' : 'grid-cols-1'} gap-4 mb-6`}>
          {/* Employee list panel */}
          {showEmployeePanel && !isMobile && (
            <Card className="overflow-hidden h-fit bg-white rounded-xl shadow-sm">
              <EmployeeList employees={filteredEmployees} />
            </Card>
          )}
          
          {/* Schedule grid */}
          <Card className="overflow-hidden bg-white rounded-xl shadow-sm border border-gray-100">
            <WeeklyGrid 
              weekStats={weekStats}
              openShifts={openShifts as OpenShiftType[]} 
              employees={filteredEmployees}
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
          {searchQuery && (
            <span className="text-sm font-normal text-gray-500">
              (Filtered by "{searchQuery}")
            </span>
          )}
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
