
import React from 'react';
import { format, parseISO } from 'date-fns';
import { Label } from '@/components/ui/label';
import DesktopShiftPopover from './DesktopShiftPopover';
import { Employee } from '@/types/restaurant-schedule';

interface SwapShiftPopoverProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDay: Date | null;
  employees: Employee[];
  selectedEmployee: string | null;
  setSelectedEmployee: (id: string | null) => void;
  handleSubmit: () => void;
  schedules: any[];
  selectedShift: string | null;
  setSelectedShift: (id: string | null) => void;
}

const SwapShiftPopover: React.FC<SwapShiftPopoverProps> = ({
  isOpen,
  onOpenChange,
  selectedDay,
  employees,
  selectedEmployee,
  setSelectedEmployee,
  handleSubmit,
  schedules,
  selectedShift,
  setSelectedShift
}) => {
  return (
    <DesktopShiftPopover
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      selectedDay={selectedDay}
      title="Swap Shift"
      employees={employees}
      selectedEmployee={selectedEmployee}
      setSelectedEmployee={setSelectedEmployee}
      handleSubmit={handleSubmit}
    >
      <div className="space-y-2">
        <Label htmlFor="desktop-shift">Select Shift to Swap</Label>
        <select 
          id="desktop-shift"
          className="w-full p-2 border rounded-md"
          value={selectedShift || ''}
          onChange={(e) => setSelectedShift(e.target.value)}
        >
          <option value="">Select a shift</option>
          {schedules.map(schedule => (
            <option key={schedule.id} value={schedule.id}>
              {schedule.title} ({format(parseISO(schedule.start_time), 'h:mm a')} - {format(parseISO(schedule.end_time), 'h:mm a')})
            </option>
          ))}
        </select>
      </div>
    </DesktopShiftPopover>
  );
};

export default SwapShiftPopover;
