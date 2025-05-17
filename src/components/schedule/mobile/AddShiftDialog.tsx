
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import MobileShiftDialog from './MobileShiftDialog';
import { Employee } from '@/types/restaurant-schedule';

interface AddShiftDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDay: Date | null;
  employees: Employee[];
  selectedEmployee: string | null;
  setSelectedEmployee: (id: string | null) => void;
  handleSubmit: () => void;
}

const AddShiftDialog: React.FC<AddShiftDialogProps> = ({
  isOpen,
  onOpenChange,
  selectedDay,
  employees,
  selectedEmployee,
  setSelectedEmployee,
  handleSubmit
}) => {
  return (
    <MobileShiftDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      selectedDay={selectedDay}
      title="Add Shift"
      description="Add a new shift to the schedule"
      employees={employees}
      selectedEmployee={selectedEmployee}
      setSelectedEmployee={setSelectedEmployee}
      handleSubmit={handleSubmit}
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="start-time">Start Time</Label>
          <Input type="time" id="start-time" defaultValue="09:00" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end-time">End Time</Label>
          <Input type="time" id="end-time" defaultValue="17:00" />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <textarea 
          id="notes"
          className="w-full p-2 border rounded-md min-h-[80px]"
          placeholder="Add any notes about this shift"
        />
      </div>
    </MobileShiftDialog>
  );
};

export default AddShiftDialog;
