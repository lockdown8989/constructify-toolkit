
import React from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface AddShiftSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  currentDate: Date;
  isMobile: boolean;
}

const AddShiftSheet: React.FC<AddShiftSheetProps> = ({
  isOpen,
  onOpenChange,
  onSubmit,
  currentDate,
  isMobile
}) => {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className={cn(
        isMobile ? "h-[80%] rounded-t-xl pb-0" : "max-w-md",
        "overflow-y-auto"
      )} side={isMobile ? "bottom" : "right"}>
        <SheetHeader className="pb-4">
          <SheetTitle>Add New Shift</SheetTitle>
          <SheetDescription>Create a new shift on the schedule</SheetDescription>
        </SheetHeader>
        
        <div className="space-y-4 pb-20">
          <div className="space-y-2">
            <Label htmlFor="employee">Employee</Label>
            <select className="w-full p-2 border rounded-md">
              <option value="">Select an employee</option>
              <option value="emp1">Courtney Henry</option>
              <option value="emp2">Alex Jackson</option>
              <option value="emp3">Leslie Alexander</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="shift-date">Date</Label>
            <Input 
              type="date" 
              id="shift-date" 
              defaultValue={format(currentDate, 'yyyy-MM-dd')} 
            />
          </div>
          
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
            <Label htmlFor="shift-role">Role</Label>
            <select className="w-full p-2 border rounded-md">
              <option value="">Select a role</option>
              <option value="waitstaff">Waiting Staff</option>
              <option value="chef">Chef</option>
              <option value="hostess">Host/Hostess</option>
              <option value="manager">Duty Manager</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <textarea 
              id="notes"
              className="w-full p-2 border rounded-md min-h-[80px]"
              placeholder="Add any notes about this shift"
            />
          </div>
        </div>
        
        <div className={cn(
          "flex gap-2 pt-4 border-t bg-white",
          isMobile ? "fixed bottom-0 left-0 right-0 p-4" : "mt-4"
        )}>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            className="flex-1"
          >
            Cancel
          </Button>
          <Button 
            onClick={onSubmit} 
            className="flex-1"
          >
            Add Shift
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AddShiftSheet;
