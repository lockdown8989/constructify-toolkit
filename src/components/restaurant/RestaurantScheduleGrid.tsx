
import { useState, useMemo, useCallback } from 'react';
import { Employee, Shift } from '@/types/restaurant-schedule';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LayoutGrid, AlertCircle, Calendar, Grid3X3, List } from 'lucide-react';
import { OpenShiftType } from '@/types/supabase/schedules';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import WeeklyGrid from '@/components/restaurant/WeeklyGrid';
import MonthlyScheduleView from '@/components/restaurant/views/MonthlyScheduleView';
import ListView from '@/components/restaurant/views/ListView';
import OpenShiftActions from '@/components/restaurant/OpenShiftActions';
import EmployeeList from '@/components/restaurant/EmployeeList';
import ShiftDialogManager from '@/components/restaurant/ShiftDialogManager';
import { toast as sonnerToast } from 'sonner';

type ViewMode = 'week' | 'month' | 'list';

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
  const [showEmployeePanel, setShowEmployeePanel] = useState(!isMobile);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationName, setLocationName] = useState("Main Location");
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
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

  // Get mock shifts data for views
  const mockShifts: Shift[] = [];

  // Current week calculation
  const currentWeek = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
    
    return { start: startOfWeek, end: endOfWeek };
  }, []);

  if (filteredEmployees.length === 0) {
    return (
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
    );
  }

  const renderScheduleView = () => {
    switch (viewMode) {
      case 'month':
        return (
          <MonthlyScheduleView
            currentDate={currentDate}
            employees={filteredEmployees}
            shifts={mockShifts}
            openShifts={openShifts}
            onDateClick={setCurrentDate}
          />
        );
      case 'list':
        return (
          <ListView
            employees={filteredEmployees}
            shifts={mockShifts}
            openShifts={openShifts}
            currentWeek={currentWeek}
          />
        );
      default:
        return (
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
        );
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between gap-3 mb-3 sm:mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleEmployeePanel}
            className="flex items-center gap-2"
          >
            {showEmployeePanel ? "Hide" : "Show"} Staff
            <LayoutGrid className="h-4 w-4" />
          </Button>
          
          {/* View Mode Selector */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <Button 
              variant={viewMode === 'week' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setViewMode('week')}
              className="h-8 px-3 rounded-md"
            >
              <Grid3X3 className="h-3 w-3 mr-1" />
              Week
            </Button>
            <Button 
              variant={viewMode === 'month' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setViewMode('month')}
              className="h-8 px-3 rounded-md"
            >
              <Calendar className="h-3 w-3 mr-1" />
              Month
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setViewMode('list')}
              className="h-8 px-3 rounded-md"
            >
              <List className="h-3 w-3 mr-1" />
              List
            </Button>
          </div>
          
          {searchQuery && (
            <div className="text-sm text-gray-600">
              Showing {filteredEmployees.length} of {employees.length} employees
            </div>
          )}
        </div>
        
        <OpenShiftActions addOpenShift={addOpenShift} />
      </div>
      
      <div className={`grid ${showEmployeePanel && viewMode === 'week' ? 'grid-cols-1 lg:grid-cols-[320px_1fr]' : 'grid-cols-1'} gap-4 mb-6`}>
        {/* Employee list panel - only show for week view */}
        {showEmployeePanel && !isMobile && viewMode === 'week' && (
          <Card className="overflow-hidden h-fit bg-white rounded-xl shadow-sm">
            <EmployeeList employees={filteredEmployees} />
          </Card>
        )}
        
        {/* Schedule view */}
        <Card className="overflow-hidden bg-white rounded-xl shadow-sm border border-gray-100">
          {renderScheduleView()}
        </Card>
      </div>

      {/* Shift edit dialog */}
      {shiftDialog.ShiftDialogComponent}
    </>
  );
};

export default RestaurantScheduleGrid;
