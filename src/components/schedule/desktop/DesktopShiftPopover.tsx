
import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent } from '@/components/ui/popover';
import { Employee } from '@/types/restaurant-schedule';

interface DesktopShiftPopoverProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDay: Date | null;
  title: string;
  employees: Employee[];
  selectedEmployee: string | null;
  setSelectedEmployee: (id: string | null) => void;
  handleSubmit: () => void;
  children?: React.ReactNode;
}

const DesktopShiftPopover: React.FC<DesktopShiftPopoverProps> = ({
  isOpen,
  onOpenChange,
  selectedDay,
  title,
  employees,
  selectedEmployee,
  setSelectedEmployee,
  handleSubmit,
  children
}) => {
  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverContent className="w-80 p-4" align="center">
        <h3 className="text-lg font-medium mb-1">{title}</h3>
        <p className="text-sm text-gray-500 mb-4">
          {selectedDay ? format(selectedDay, 'EEEE, MMMM d, yyyy') : 'Select a date'}
        </p>
        
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="desktop-employee">Employee</Label>
            <select 
              id="desktop-employee"
              className="w-full p-2 border rounded-md"
              value={selectedEmployee || ''}
              onChange={(e) => setSelectedEmployee(e.target.value)}
            >
              <option value="">Select an employee</option>
              {employees.map(employee => (
                <option key={employee.id} value={employee.id}>{employee.name}</option>
              ))}
            </select>
          </div>
          
          {children}
          
          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSubmit}>
              {title.split(' ')[0]} Shift
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DesktopShiftPopover;
