
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateSchedule } from '@/hooks/use-schedules';
import { useToast } from '@/hooks/use-toast';
import { Employee } from '@/types/employee';
import { format } from 'date-fns';
import { Clock, CalendarDays, MapPin, FileText, User } from 'lucide-react';

interface NewScheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
}

const NewScheduleDialog: React.FC<NewScheduleDialogProps> = ({
  isOpen,
  onClose,
  employees
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  const { createSchedule, isCreating } = useCreateSchedule();
  const { toast } = useToast();

  // Calculate shift duration
  const calculateDuration = () => {
    try {
      const startParts = startTime.split(':');
      const endParts = endTime.split(':');
      
      if (startParts.length !== 2 || endParts.length !== 2) return "Invalid time";
      
      const startHour = parseInt(startParts[0]);
      const startMinute = parseInt(startParts[1]);
      const endHour = parseInt(endParts[0]);
      const endMinute = parseInt(endParts[1]);
      
      let hours = endHour - startHour;
      let minutes = endMinute - startMinute;
      
      if (minutes < 0) {
        minutes += 60;
        hours -= 1;
      }
      
      if (hours < 0) hours += 24;
      
      return `${hours}h ${minutes}m`;
    } catch (e) {
      return "Invalid time";
    }
  };

  const getEmployeeDetails = () => {
    const employee = employees.find(emp => emp.id === selectedEmployee);
    return employee ? employee.name : "Select an employee";
  };

  const handleSubmit = async () => {
    if (!selectedEmployee || !title || !date || !startTime || !endTime) {
      toast({
        title: "Missing information",
        description: "Please fill out all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Create the start and end date objects
    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);

    // If end time is earlier than start time, assume it's for the next day
    if (endDateTime < startDateTime) {
      endDateTime.setDate(endDateTime.getDate() + 1);
    }

    try {
      await createSchedule.mutateAsync({
        employee_id: selectedEmployee,
        title,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        location,
        notes,
        status: 'pending',
        shift_type: 'regular'
      });

      toast({
        title: "Schedule created",
        description: "The schedule has been created successfully.",
      });

      // Reset form and close dialog
      setSelectedEmployee('');
      setTitle('');
      setDate(new Date().toISOString().split('T')[0]);
      setStartTime('09:00');
      setEndTime('17:00');
      setLocation('');
      setNotes('');
      onClose();
    } catch (error) {
      console.error('Error creating schedule:', error);
      toast({
        title: "Failed to create schedule",
        description: "An error occurred while creating the schedule.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[500px] overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Create New Schedule</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2 bg-indigo-50 p-3 rounded-lg border border-indigo-100">
            <div className="flex items-center gap-2 mb-1">
              <User className="h-4 w-4 text-indigo-600" />
              <Label htmlFor="employee" className="text-indigo-700 font-medium">Employee</Label>
            </div>
            <Select 
              value={selectedEmployee} 
              onValueChange={setSelectedEmployee}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedEmployee && 
              <div className="mt-2 text-xs bg-indigo-100 p-2 rounded text-indigo-700">
                Selected: {getEmployeeDetails()}
              </div>
            }
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="title">Department/Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Front Office, Operations"
              className="border-gray-300"
            />
          </div>
          
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <CalendarDays className="h-4 w-4 text-blue-600" />
              <Label htmlFor="date" className="text-blue-700 font-medium">Date</Label>
            </div>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-white mb-2"
            />
            <div className="text-xs text-blue-600">
              {date ? format(new Date(date), 'EEEE, MMMM d, yyyy') : 'Select date'}
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-3 border border-green-100">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-600" />
                <Label htmlFor="startTime" className="text-green-700 font-medium">Shift Time</Label>
              </div>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Duration: {calculateDuration()}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="startTime" className="text-xs">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="bg-white"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="endTime" className="text-xs">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="bg-white"
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <Label htmlFor="location">Location</Label>
            </div>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Main Office"
              className="border-gray-300"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <Label htmlFor="notes">Notes (Optional)</Label>
            </div>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 border rounded-md min-h-[80px] border-gray-300"
              placeholder="Additional information about this shift"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isCreating} 
            className="bg-blue-500 hover:bg-blue-600"
          >
            {isCreating ? "Creating..." : "Create Schedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewScheduleDialog;
