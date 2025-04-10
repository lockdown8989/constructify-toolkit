
import { StaffRole, Shift } from '@/types/restaurant-schedule';
import RoleSection from './RoleSection';

interface RolesSectionListProps {
  roles: StaffRole[];
  organizedShifts: Record<string, Record<string, Shift[]>>;
  onEditShift: (shift: Shift) => void;
  onDeleteShift: (shiftId: string) => void;
  onAddShift: (employeeId: string, day: string) => void;
  onAddNote: (shiftId: string) => void;
  onAddBreak: (shiftId: string) => void;
}

const RolesSectionList = ({
  roles,
  organizedShifts,
  onEditShift,
  onDeleteShift,
  onAddShift,
  onAddNote,
  onAddBreak
}: RolesSectionListProps) => {
  return (
    <>
      {roles.map(role => (
        <RoleSection
          key={role.id}
          role={role}
          shifts={organizedShifts}
          onEditShift={onEditShift}
          onDeleteShift={onDeleteShift}
          onAddShift={onAddShift}
          onAddNote={onAddNote}
          onAddBreak={onAddBreak}
        />
      ))}
    </>
  );
};

export default RolesSectionList;
