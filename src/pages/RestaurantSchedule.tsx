
import { useMemo } from 'react';
import { useRestaurantSchedule } from '@/hooks/use-restaurant-schedule';
import { Shift } from '@/types/restaurant-schedule';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import ScheduleHeader from '@/components/restaurant/ScheduleHeader';
import WeeklyGrid from '@/components/restaurant/WeeklyGrid';
import ShiftDialogManager from '@/components/restaurant/ShiftDialogManager';
import RolesSectionList from '@/components/restaurant/RolesSectionList';
import OpenShiftActions from '@/components/restaurant/OpenShiftActions';
import { useShiftUtilities } from '@/components/restaurant/ShiftUtilities';
import { days, formatCurrency } from '@/components/restaurant/utils/schedule-utils';

const RestaurantSchedule = () => {
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
    setViewMode
  } = useRestaurantSchedule();
  
  const { toast } = useToast();
  const { handleAddNote, handleAddBreak } = useShiftUtilities(updateShift);
  
  // Get the shift dialog manager with all its functions and component
  const shiftDialog = ShiftDialogManager({ addShift, updateShift });
  
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
  
  return (
    <div className="container py-8 max-w-[1400px] px-4 md:px-6 mx-auto">
      <div className="mb-6">
        <ScheduleHeader setViewMode={setViewMode} />
      </div>
      
      <div className="flex justify-end mb-4">
        <OpenShiftActions addOpenShift={addOpenShift} />
      </div>
      
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <WeeklyGrid 
          weekStats={weekStats}
          openShifts={openShifts}
          employees={employees}
          daysDisplayNames={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']}
          formatCurrency={formatCurrency}
          handleAssignOpenShift={handleAssignOpenShift}
          previousWeek={previousWeek}
          nextWeek={nextWeek}
        />
      </div>
      
      {/* Role sections */}
      <div className="space-y-5">
        <RolesSectionList
          roles={weekStats.roles}
          organizedShifts={organizedShifts}
          onEditShift={shiftDialog.handleEditShift}
          onDeleteShift={removeShift}
          onAddShift={shiftDialog.handleAddShift}
          onAddNote={(shiftId) => handleAddNote(shiftId, shifts)}
          onAddBreak={(shiftId) => handleAddBreak(shiftId, shifts)}
        />
      </div>
      
      {/* Shift edit dialog */}
      {shiftDialog.ShiftDialogComponent}
    </div>
  );
};

export default RestaurantSchedule;
