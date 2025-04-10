
import { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Coffee, 
  FileText,
  Plus,
  Check
} from 'lucide-react';
import { format } from 'date-fns';
import { useRestaurantSchedule } from '@/hooks/use-restaurant-schedule';
import { OpenShift, Shift, ViewMode } from '@/types/restaurant-schedule';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OpenShiftBlock from '@/components/restaurant/OpenShiftBlock';
import RoleSection from '@/components/restaurant/RoleSection';
import ShiftEditDialog from '@/components/restaurant/ShiftEditDialog';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

const RestaurantSchedule = () => {
  const { 
    employees,
    shifts,
    openShifts,
    weekStats,
    viewMode,
    addShift,
    updateShift,
    removeShift,
    addOpenShift,
    assignOpenShift,
    toggleViewMode,
    previousWeek,
    nextWeek,
    setViewMode
  } = useRestaurantSchedule();
  
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isShiftDialogOpen, setIsShiftDialogOpen] = useState(false);
  const [currentShift, setCurrentShift] = useState<Shift | undefined>(undefined);
  const [newShiftEmployeeId, setNewShiftEmployeeId] = useState<string | null>(null);
  const [newShiftDay, setNewShiftDay] = useState<string | null>(null);
  const [selectedOpenShiftId, setSelectedOpenShiftId] = useState<string | null>(null);
  
  // Days of the week
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const daysDisplayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Organize shifts by employee and day
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
  }, [employees, shifts, days]);
  
  // Handle opening the shift dialog for editing
  const handleEditShift = (shift: Shift) => {
    setCurrentShift(shift);
    setIsShiftDialogOpen(true);
  };
  
  // Handle opening the shift dialog for adding a new shift
  const handleAddShift = (employeeId: string, day: string) => {
    setNewShiftEmployeeId(employeeId);
    setNewShiftDay(day);
    
    // Create a default new shift
    const newShift: Shift = {
      id: '',
      employeeId,
      day,
      startTime: '09:00',
      endTime: '17:00',
      role: employees.find(e => e.id === employeeId)?.role || '',
      hasBreak: false,
      isUnavailable: false
    };
    
    setCurrentShift(newShift);
    setIsShiftDialogOpen(true);
  };
  
  // Handle saving a shift (new or existing)
  const handleSaveShift = (shift: Shift) => {
    if (shift.id) {
      // Update existing shift
      updateShift(shift);
    } else {
      // Add new shift with generated ID
      const newShift = {
        ...shift,
        employeeId: newShiftEmployeeId || '',
        day: newShiftDay || ''
      };
      
      addShift(newShift);
    }
    
    // Reset state
    setCurrentShift(undefined);
    setNewShiftEmployeeId(null);
    setNewShiftDay(null);
  };
  
  // Handle adding a note to a shift
  const handleAddNote = (shiftId: string) => {
    const shift = shifts.find(s => s.id === shiftId);
    if (shift) {
      const updatedShift = {
        ...shift,
        notes: 'New note'
      };
      
      updateShift(updatedShift);
      
      toast({
        title: "Note added",
        description: "A note has been added to the shift",
      });
    }
  };
  
  // Handle adding a break to a shift
  const handleAddBreak = (shiftId: string) => {
    const shift = shifts.find(s => s.id === shiftId);
    if (shift) {
      const updatedShift = {
        ...shift,
        hasBreak: true,
        breakDuration: 30
      };
      
      updateShift(updatedShift);
      
      toast({
        title: "Break added",
        description: "A 30-minute break has been added to the shift",
      });
    }
  };
  
  // Handle showing assignment dialog for an open shift
  const handleAssignOpenShift = (openShiftId: string) => {
    setSelectedOpenShiftId(openShiftId);
    
    toast({
      title: "Feature coming soon",
      description: "The ability to assign open shifts will be available soon.",
    });
  };
  
  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  return (
    <div className="container py-6 max-w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Shift Calendar Schedule</h1>
        
        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
          <Tabs 
            defaultValue="week" 
            onValueChange={(value) => setViewMode(value as ViewMode)}
            className="bg-gray-100 rounded-full p-1"
          >
            <TabsList className="bg-transparent">
              <TabsTrigger 
                value="week" 
                className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Week
              </TabsTrigger>
              <TabsTrigger 
                value="month" 
                className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Month
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search employees or roles..." 
              className="pl-9 rounded-full border-gray-200"
            />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-9 gap-0 border rounded-t-xl bg-white shadow-sm overflow-hidden">
        {/* Week summary column */}
        <div className="col-span-1 border-r border-gray-200">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="text-sm font-medium text-gray-700">Week {weekStats.weekNumber} summary</div>
          </div>
          
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center">
                <span className="text-gray-600 font-medium mr-2">H</span>
                <span className="text-gray-900 font-semibold">{weekStats.totalHours.toFixed(0)}h</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600 font-medium mr-2">C</span>
                <span className="text-gray-900 font-semibold">{formatCurrency(weekStats.totalCost)}</span>
              </div>
            </div>
          </div>
          
          <div className="p-4">
            <div className="font-semibold mb-2">Open Shifts</div>
            <div className="text-sm text-gray-600">
              <div>{weekStats.openShiftsTotalHours.toFixed(0)}h 30m</div>
              <div>{weekStats.openShiftsTotalCount} shifts</div>
            </div>
          </div>
        </div>
        
        {/* Days columns */}
        {weekStats.days.map((day, index) => (
          <div key={day.day} className="col-span-1 border-r border-gray-200">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="flex items-center">
                <span className="font-bold text-lg mr-2">{index + 1}</span>
                <span className="text-gray-700">{daysDisplayNames[index]}</span>
              </div>
              <div className="flex space-x-2">
                {index === 0 && (
                  <Button variant="outline" size="icon" onClick={previousWeek} className="rounded-full h-7 w-7">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                )}
                {index === 1 && (
                  <Button variant="outline" size="icon" onClick={nextWeek} className="rounded-full h-7 w-7">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-col space-y-1">
                <div className="text-gray-900 font-semibold">{day.totalHours.toFixed(0)}h</div>
                <div className="text-gray-900 font-semibold">{formatCurrency(day.totalCost)}</div>
              </div>
            </div>
            
            <div className="p-2">
              {openShifts
                .filter(s => s.day === day.day)
                .map(openShift => (
                  <OpenShiftBlock
                    key={openShift.id}
                    openShift={openShift}
                    color={openShift.role.includes('Waiting') ? 'yellow' : 'blue'}
                    onAssign={handleAssignOpenShift}
                  />
                ))
              }
            </div>
          </div>
        ))}
      </div>
      
      {/* Role sections */}
      {weekStats.roles.map(role => (
        <RoleSection
          key={role.id}
          role={role}
          shifts={organizedShifts}
          onEditShift={handleEditShift}
          onDeleteShift={removeShift}
          onAddShift={handleAddShift}
          onAddNote={handleAddNote}
          onAddBreak={handleAddBreak}
        />
      ))}
      
      {/* Shift edit dialog */}
      <ShiftEditDialog
        isOpen={isShiftDialogOpen}
        onClose={() => setIsShiftDialogOpen(false)}
        shift={currentShift}
        onSave={handleSaveShift}
      />
    </div>
  );
};

export default RestaurantSchedule;
