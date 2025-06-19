
import { useState, useMemo, useCallback } from 'react';
import { Employee, Shift } from '@/types/restaurant-schedule';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LayoutGrid, AlertCircle } from 'lucide-react';
import { OpenShiftType } from '@/types/supabase/schedules';
import { useToast } from '@/hooks/use-toast';
import WeeklyGrid from '@/components/restaurant/WeeklyGrid';
import OpenShiftActions from '@/components/restaurant/OpenShiftActions';
import EmployeeList from '@/components/restaurant/EmployeeList';
import ShiftDialogManager from '@/components/restaurant/ShiftDialogManager';

interface RestaurantScheduleGridProps {
  employees: Employee[];
  weekStats: any;
  openShifts: OpenShiftType[];
  formatCurrency: (amount: number) => string;
  handleAssignOpenShift: (openShiftId: string, employeeId?: string) => void;
  previousWeek: () => void;
  nextWeek: () => void;
  isMobile: boolean;
  addOpenShift: (shift: any) => void;
  addShift: (shift: Omit<Shift, 'id'>) => Promise<void>;
  updateShift: (shift: Shift) => Promise<void>;
  removeShift: (shiftId: string) => Promise<void>;
}

const RestaurantScheduleGrid = ({
  employees,
  weekStats,
  openShifts,
  formatCurrency,
  handleAssignOpenShift,
  previousWeek,
  nextWeek,
  isMobile,
  addOpenShift,
  addShift,
  updateShift,
  removeShift
}: RestaurantScheduleGridProps) => {
  const [showEmployeePanel, setShowEmployeePanel] = useState(!isMobile); // Hide by default on mobile
  const [searchQuery, setSearchQuery] = useState("");
  const [locationName, setLocationName] = useState("Main Location");
  const { toast } = useToast();

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
    toast({
      title: "Shift created successfully",
      description: "The shift has been added to the schedule.",
    });
  }, [toast]);
  
  // Get the shift dialog manager with all its functions and component
  const shiftDialog = ShiftDialogManager({ 
    addShift, 
    updateShift, 
    onResponseComplete: handleShiftCreated 
  });

  const toggleEmployeePanel = () => {
    setShowEmployeePanel(!showEmployeePanel);
  };

  if (filteredEmployees.length === 0) {
    return (
      <Card className="p-6 text-center mb-6">
        <div className="flex flex-col items-center gap-3">
          <AlertCircle className="h-12 w-12 text-amber-500" />
          <h3 className="text-lg font-semibold">
            {searchQuery ? "No employees found" : "No Employees Found"}
          </h3>
          <p className="text-gray-600 max-w-md mx-auto text-sm">
            {searchQuery 
              ? `No employees match "${searchQuery}" at ${locationName}. Try adjusting your search.`
              : "There are no employees available to schedule. Add employees to get started with scheduling."
            }
          </p>
          <div className="flex gap-2 mt-2">
            {searchQuery && (
              <Button variant="outline" size="sm" onClick={() => setSearchQuery("")}>
                Clear Search
              </Button>
            )}
            {!searchQuery && (
              <Button variant="default" size="sm">Add Employees</Button>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls Header */}
      <div className={`flex ${isMobile ? 'flex-col gap-3' : 'justify-between items-center'}`}>
        <div className="flex items-center gap-2">
          {!isMobile && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleEmployeePanel}
              className="flex items-center gap-2"
            >
              {showEmployeePanel ? "Hide" : "Show"} Employees
              <LayoutGrid className="h-4 w-4" />
            </Button>
          )}
          {searchQuery && (
            <div className="text-sm text-gray-600">
              Showing {filteredEmployees.length} of {employees.length} employees
            </div>
          )}
        </div>
        <OpenShiftActions addOpenShift={addOpenShift} />
      </div>
      
      {/* Main Content Grid */}
      <div className={isMobile ? 'space-y-4' : `grid ${showEmployeePanel ? 'grid-cols-[280px_1fr]' : 'grid-cols-1'} gap-4`}>
        {/* Employee list panel - Desktop only */}
        {showEmployeePanel && !isMobile && (
          <Card className="overflow-hidden h-fit bg-white rounded-xl shadow-sm max-h-[600px]">
            <EmployeeList employees={filteredEmployees} />
          </Card>
        )}
        
        {/* Schedule grid */}
        <Card className="overflow-hidden bg-white rounded-xl shadow-sm border border-gray-100">
          <WeeklyGrid 
            weekStats={weekStats}
            openShifts={openShifts} 
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

      {/* Shift edit dialog */}
      {shiftDialog.ShiftDialogComponent}
    </div>
  );
};

export default RestaurantScheduleGrid;
