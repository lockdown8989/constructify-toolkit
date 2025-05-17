
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, addHours, setHours, setMinutes } from 'date-fns';
import { Employee } from '@/types/restaurant-schedule';
import { Loader2 } from 'lucide-react';

interface AddEmployeeShiftDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDay: Date | null;
  employees: Employee[];
  selectedEmployee: string | null;
  setSelectedEmployee: (employeeId: string | null) => void;
  handleSubmit: (data: any) => void;
  isLoading?: boolean;
}

const AddEmployeeShiftDialog: React.FC<AddEmployeeShiftDialogProps> = ({
  isOpen,
  onOpenChange,
  selectedDay,
  employees,
  selectedEmployee,
  setSelectedEmployee,
  handleSubmit,
  isLoading = false
}) => {
  const defaultStartTime = selectedDay 
    ? setHours(setMinutes(new Date(selectedDay), 0), 9) 
    : setHours(setMinutes(new Date(), 0), 9);
  const defaultEndTime = selectedDay 
    ? addHours(defaultStartTime, 8) 
    : addHours(setHours(setMinutes(new Date(), 0), 9), 8);
  
  const [formData, setFormData] = useState({
    title: 'Shift',
    start_time: defaultStartTime.toISOString(),
    end_time: defaultEndTime.toISOString(),
    notes: '',
    location: '',
  });
  
  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit({
      ...formData,
      employeeId: selectedEmployee
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Employee Shift</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleFormSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="employee">Employee</Label>
            <Select value={selectedEmployee || ''} onValueChange={setSelectedEmployee}>
              <SelectTrigger>
                <SelectValue placeholder="Select employee" />
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
          
          <div className="space-y-2">
            <Label htmlFor="title">Shift Title</Label>
            <Input 
              id="title" 
              value={formData.title} 
              onChange={e => handleFormChange('title', e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time</Label>
              <Input 
                id="start_time" 
                type="datetime-local" 
                value={formData.start_time.substring(0, 16)} 
                onChange={e => handleFormChange('start_time', new Date(e.target.value).toISOString())}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time">End Time</Label>
              <Input 
                id="end_time" 
                type="datetime-local" 
                value={formData.end_time.substring(0, 16)} 
                onChange={e => handleFormChange('end_time', new Date(e.target.value).toISOString())}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Location (Optional)</Label>
            <Input 
              id="location" 
              value={formData.location} 
              onChange={e => handleFormChange('location', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea 
              id="notes" 
              value={formData.notes} 
              onChange={e => handleFormChange('notes', e.target.value)}
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : 'Create Shift'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEmployeeShiftDialog;
