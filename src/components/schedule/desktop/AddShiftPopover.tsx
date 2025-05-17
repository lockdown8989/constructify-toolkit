
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import DesktopShiftPopover from './DesktopShiftPopover';
import { Employee } from '@/types/restaurant-schedule';

interface AddShiftPopoverProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDay: Date | null;
  employees: Employee[];
  selectedEmployee: string | null;
  setSelectedEmployee: (id: string | null) => void;
  handleSubmit: () => void;
}

const AddShiftPopover: React.FC<AddShiftPopoverProps> = ({
  isOpen,
  onOpenChange,
  selectedDay,
  employees,
  selectedEmployee,
  setSelectedEmployee,
  handleSubmit
}) => {
  return (
    <DesktopShiftPopover
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      selectedDay={selectedDay}
      title="Add Shift"
      employees={employees}
      selectedEmployee={selectedEmployee}
      setSelectedEmployee={setSelectedEmployee}
      handleSubmit={handleSubmit}
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="desktop-start-time">Start Time</Label>
          <Input type="time" id="desktop-start-time" defaultValue="09:00" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="desktop-end-time">End Time</Label>
          <Input type="time" id="desktop-end-time" defaultValue="17:00" />
        </div>
      </div>
    </DesktopShiftPopover>
  );
};

export default AddShiftPopover;
