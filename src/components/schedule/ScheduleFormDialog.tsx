
import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ScheduleFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  newSchedule: {
    title: string;
    employeeId: string;
    startTime: string;
    endTime: string;
  };
  setNewSchedule: React.Dispatch<React.SetStateAction<{
    title: string;
    employeeId: string;
    startTime: string;
    endTime: string;
  }>>;
  handleSubmit: () => void;
  employees: any[];
  date: Date | undefined;
}

const ScheduleFormDialog: React.FC<ScheduleFormProps> = ({
  isOpen,
  setIsOpen,
  newSchedule,
  setNewSchedule,
  handleSubmit,
  employees,
  date
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Schedule</DialogTitle>
          <DialogDescription>
            Create a new schedule for an employee on {date ? format(date, 'MMMM d, yyyy') : 'the selected date'}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={newSchedule.title}
              onChange={(e) => setNewSchedule({ ...newSchedule, title: e.target.value })}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="employee" className="text-right">
              Employee
            </Label>
            <Select 
              value={newSchedule.employeeId} 
              onValueChange={(value) => setNewSchedule({ ...newSchedule, employeeId: value })}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select an employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map(employee => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startTime" className="text-right">
              Start Time
            </Label>
            <Input
              id="startTime"
              type="time"
              value={newSchedule.startTime}
              onChange={(e) => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endTime" className="text-right">
              End Time
            </Label>
            <Input
              id="endTime"
              type="time"
              value={newSchedule.endTime}
              onChange={(e) => setNewSchedule({ ...newSchedule, endTime: e.target.value })}
              className="col-span-3"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Create Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleFormDialog;
