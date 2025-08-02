
import { Shift, StaffRole } from '@/types/restaurant-schedule';
import { Calendar } from 'lucide-react';
import RolesSectionList from '@/components/restaurant/RolesSectionList';
import ShiftDialogManager from '@/components/restaurant/ShiftDialogManager';

interface RestaurantScheduleRolesProps {
  weekStats: { roles: StaffRole[] };
  organizedShifts: Record<string, Record<string, Shift[]>>;
  removeShift: (shiftId: string) => Promise<void>;
  handleAddNote: (shiftId: string, shifts: Shift[]) => void;
  handleAddBreak: (shiftId: string, shifts: Shift[]) => void;
  isMobile: boolean;
  addShift: (shift: Omit<Shift, 'id'>) => Promise<void>;
  updateShift: (shift: Shift) => Promise<void>;
}

const RestaurantScheduleRoles = ({
  weekStats,
  organizedShifts,
  removeShift,
  handleAddNote,
  handleAddBreak,
  isMobile,
  addShift,
  updateShift
}: RestaurantScheduleRolesProps) => {
  // Create wrapper for delete function to match expected signature
  const handleDeleteShift = async (shift: any) => {
    await removeShift(shift.id);
  };

  // Get the shift dialog manager with all its functions and component
  const shiftDialog = ShiftDialogManager({ 
    addShift, 
    updateShift,
    deleteShift: handleDeleteShift
  });

  return (
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
        onAddNote={(shiftId) => handleAddNote(shiftId, [])}
        onAddBreak={(shiftId) => handleAddBreak(shiftId, [])}
        isMobile={isMobile}
      />

      {/* Shift edit dialog */}
      {shiftDialog.ShiftDialogComponent}
    </div>
  );
};

export default RestaurantScheduleRoles;
