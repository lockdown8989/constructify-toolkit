
import { useState, useMemo, useEffect } from 'react';
import { useRestaurantSchedule } from '@/hooks/use-restaurant-schedule';
import { Shift, ViewMode, OpenShift } from '@/types/restaurant-schedule';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import ScheduleHeader from '@/components/restaurant/ScheduleHeader';
import WeeklyGrid from '@/components/restaurant/WeeklyGrid';
import RoleSection from '@/components/restaurant/RoleSection';
import ShiftEditDialog from '@/components/restaurant/ShiftEditDialog';

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
  
  // Add function to create an open shift
  const handleAddOpenShift = () => {
    const newOpenShift: Omit<OpenShift, 'id'> = {
      day: 'monday',
      startTime: '09:00',
      endTime: '17:00',
      role: 'Staff',
      notes: 'New open shift'
    };
    
    addOpenShift(newOpenShift);
    
    toast({
      title: "Open shift added",
      description: "A new open shift has been added to Monday",
    });
  };
  
  // Handle showing assignment dialog for an open shift
  const handleAssignOpenShift = (openShiftId: string, employeeId?: string) => {
    if (employeeId) {
      // Direct assignment from drag and drop
      assignOpenShift(openShiftId, employeeId);
    } else {
      // Show assignment dialog (legacy method)
      setSelectedOpenShiftId(openShiftId);
      
      toast({
        title: "Feature coming soon",
        description: "The ability to assign open shifts will be available soon.",
      });
    }
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
      <div className="flex justify-between items-center mb-4">
        <ScheduleHeader setViewMode={setViewMode} />
        <button
          onClick={handleAddOpenShift}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Add Open Shift
        </button>
      </div>
      
      <WeeklyGrid 
        weekStats={weekStats}
        openShifts={openShifts}
        employees={employees}
        daysDisplayNames={daysDisplayNames}
        formatCurrency={formatCurrency}
        handleAssignOpenShift={handleAssignOpenShift}
        previousWeek={previousWeek}
        nextWeek={nextWeek}
      />
      
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
