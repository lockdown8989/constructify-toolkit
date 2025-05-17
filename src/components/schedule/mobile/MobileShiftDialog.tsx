
import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Employee } from '@/types/restaurant-schedule';

interface MobileShiftDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDay: Date | null;
  title: string;
  description: string;
  employees: Employee[];
  selectedEmployee: string | null;
  setSelectedEmployee: (id: string | null) => void;
  handleSubmit: () => void;
  children?: React.ReactNode;
}

const MobileShiftDialog: React.FC<MobileShiftDialogProps> = ({
  isOpen,
  onOpenChange,
  selectedDay,
  title,
  description,
  employees,
  selectedEmployee,
  setSelectedEmployee,
  handleSubmit,
  children
}) => {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[75%] pb-0 rounded-t-xl">
        <SheetHeader className="text-left pb-4">
          <SheetTitle className="text-xl">{title}</SheetTitle>
          <SheetDescription>
            {selectedDay ? format(selectedDay, 'EEEE, MMMM d, yyyy') : 'Select a date'}
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-4 pb-20">
          <div className="space-y-2">
            <Label htmlFor="employee">Employee</Label>
            <select 
              id="employee"
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
        </div>
        
        <div className="flex gap-2 pt-4 border-t fixed bottom-0 left-0 right-0 bg-white p-4 rounded-t-xl">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            className="flex-1"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {title.split(' ')[0]} Shift
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileShiftDialog;
