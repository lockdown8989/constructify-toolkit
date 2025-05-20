
import React, { useState } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar, UserPlus, Loader2, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEmployees } from '@/hooks/use-employees';
import { createShiftAssignment, createEmployeeWithShift, recordCalendarAction } from '@/utils/calendar-actions';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

interface DateActionMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onAddShift?: () => void;
  onAddEmployee?: () => void;
  hasManagerAccess?: boolean;
  selectedDate?: Date;
}

const DateActionMenu: React.FC<DateActionMenuProps> = ({
  isOpen,
  onClose,
  onAddShift,
  onAddEmployee,
  hasManagerAccess = false,
  selectedDate
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: employees = [] } = useEmployees({});
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  // New states for the shift creation form
  const [shiftTitle, setShiftTitle] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [includeBreak, setIncludeBreak] = useState(false);
  const [breakDuration, setBreakDuration] = useState('30');
  const [isAddShiftFormOpen, setIsAddShiftFormOpen] = useState(false);
  const [isAddEmployeeFormOpen, setIsAddEmployeeFormOpen] = useState(false);
  
  // Function to log calendar actions
  const logCalendarAction = async (actionType: string, additionalDetails = {}) => {
    if (!user) return;
    
    try {
      await supabase.from('calendar_actions').insert({
        action_type: actionType,
        date: selectedDate?.toISOString(),
        initiator_id: user.id,
        details: {
          date_selected: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null,
          platform: window.innerWidth < 768 ? 'mobile' : 'desktop',
          ...additionalDetails
        }
      });
      
      console.log(`Calendar action logged: ${actionType}`);
    } catch (error) {
      console.error('Error logging calendar action:', error);
    }
  };

  // Open the add shift form
  const openAddShiftForm = async () => {
    await logCalendarAction('open_add_shift_form');
    setIsAddShiftFormOpen(true);
  };
  
  // Open the add employee form
  const openAddEmployeeForm = async () => {
    await logCalendarAction('open_add_employee_form');
    setIsAddEmployeeFormOpen(true);
  };

  // Create open shift for all employees
  const createOpenShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !user) return;
    
    try {
      setIsProcessing(true);
      
      // Format the date with the selected time
      const startDateTime = new Date(selectedDate);
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      startDateTime.setHours(startHours, startMinutes, 0, 0);
      
      const endDateTime = new Date(selectedDate);
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      endDateTime.setHours(endHours, endMinutes, 0, 0);
      
      // Create the open shift
      const { data: newShift, error } = await supabase.from('open_shifts').insert({
        title: shiftTitle || 'Open Shift',
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        location: location || null,
        notes: notes || null,
        role: shiftTitle || 'Staff',
        status: 'open',
        created_by: user.id,
        created_platform: window.innerWidth < 768 ? 'mobile' : 'desktop',
        last_modified_platform: window.innerWidth < 768 ? 'mobile' : 'desktop'
      }).select().single();
      
      if (error) throw error;
      
      // Log the action
      await logCalendarAction('create_open_shift', { 
        shift_id: newShift.id,
        shift_title: shiftTitle,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        includes_break: includeBreak,
        break_duration: includeBreak ? breakDuration : null
      });
      
      // Notify about successful creation
      toast({
        title: "Open Shift Created",
        description: `A new shift has been created and is available for employees.`,
      });
      
      // Reset form and close
      resetAddShiftForm();
      setIsAddShiftFormOpen(false);
      onClose();
      
    } catch (error) {
      console.error('Error creating open shift:', error);
      toast({
        title: "Error",
        description: "Failed to create the open shift. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Function to add a new employee
  const handleAddNewEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      setIsProcessing(true);
      
      const employeeDetails = {
        name: (document.getElementById('employee-name') as HTMLInputElement)?.value || '',
        job_title: (document.getElementById('job-title') as HTMLInputElement)?.value || '',
        department: (document.getElementById('department') as HTMLInputElement)?.value || '',
        hourly_rate: parseFloat((document.getElementById('hourly-rate') as HTMLInputElement)?.value || '0')
      };
      
      if (!employeeDetails.name) {
        throw new Error('Employee name is required');
      }
      
      // Only create a shift if we have a selected date and times
      let shiftDetails = undefined;
      
      if (selectedDate && startTime && endTime) {
        const startDateTime = new Date(selectedDate);
        const [startHours, startMinutes] = startTime.split(':').map(Number);
        startDateTime.setHours(startHours, startMinutes, 0, 0);
        
        const endDateTime = new Date(selectedDate);
        const [endHours, endMinutes] = endTime.split(':').map(Number);
        endDateTime.setHours(endHours, endMinutes, 0, 0);
        
        shiftDetails = {
          title: employeeDetails.job_title || 'Shift',
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          location: location || undefined
        };
      }
      
      // Create employee with optional initial shift
      const employee = await createEmployeeWithShift(employeeDetails, shiftDetails);
      
      // Log the action
      await logCalendarAction('create_employee', {
        employee_id: employee.id,
        employee_name: employeeDetails.name,
        job_title: employeeDetails.job_title,
        with_initial_shift: !!shiftDetails
      });
      
      toast({
        title: "Employee Added",
        description: `${employeeDetails.name} has been added successfully${shiftDetails ? ' with an initial shift' : ''}.`,
      });
      
      // Reset form and close
      resetAddEmployeeForm();
      setIsAddEmployeeFormOpen(false);
      onClose();
      
    } catch (error) {
      console.error('Error adding employee:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add employee",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset the add shift form
  const resetAddShiftForm = () => {
    setShiftTitle('');
    setStartTime('09:00');
    setEndTime('17:00');
    setLocation('');
    setNotes('');
    setIncludeBreak(false);
    setBreakDuration('30');
  };
  
  // Reset the add employee form
  const resetAddEmployeeForm = () => {
    // Reset employee form fields
    const nameInput = document.getElementById('employee-name') as HTMLInputElement;
    const jobTitleInput = document.getElementById('job-title') as HTMLInputElement;
    const departmentInput = document.getElementById('department') as HTMLInputElement;
    const hourlyRateInput = document.getElementById('hourly-rate') as HTMLInputElement;
    
    if (nameInput) nameInput.value = '';
    if (jobTitleInput) jobTitleInput.value = '';
    if (departmentInput) departmentInput.value = '';
    if (hourlyRateInput) hourlyRateInput.value = '';
    
    // Reset time fields too
    setStartTime('09:00');
    setEndTime('17:00');
    setLocation('');
  };

  // Handle add shift via existing callback
  const handleAddShift = async () => {
    try {
      setIsProcessing(true);
      await logCalendarAction('open_add_shift_dialog');

      if (selectedDate) {
        // Format time to be at the start of business hours (9 AM)
        const startTime = new Date(selectedDate);
        startTime.setHours(9, 0, 0, 0);
        
        // End time is 8 hours later
        const endTime = new Date(startTime);
        endTime.setHours(startTime.getHours() + 8);

        // If direct API call is needed before opening dialog
        await supabase.from('calendar_actions').insert({
          action_type: 'prepare_add_shift',
          date: selectedDate.toISOString(),
          initiator_id: user?.id,
          details: {
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString()
          }
        });
      }
      
      if (onAddShift) {
        onAddShift();
      }
      
      toast({
        title: "Add Shift",
        description: "Opening shift creation dialog",
      });
    } catch (error) {
      console.error('Error in handleAddShift:', error);
      toast({
        title: "Error",
        description: "Failed to open shift dialog",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      onClose();
    }
  };

  // Handle add employee with logging
  const handleAddEmployee = async () => {
    try {
      setIsProcessing(true);
      await logCalendarAction('open_add_employee_dialog');
      
      // Prepare data for future employee creation
      if (selectedDate) {
        // Record the intent in database
        await supabase.from('calendar_actions').insert({
          action_type: 'prepare_add_employee',
          date: selectedDate.toISOString(),
          initiator_id: user?.id,
          details: {
            date_selected: format(selectedDate, 'yyyy-MM-dd'),
            existing_employees_count: employees.length
          }
        });
      }
      
      if (onAddEmployee) {
        onAddEmployee();
      }
      
      toast({
        title: "Add Employee",
        description: "Opening employee creation dialog",
      });
    } catch (error) {
      console.error('Error in handleAddEmployee:', error);
      toast({
        title: "Error", 
        description: "Failed to open employee dialog",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      onClose();
    }
  };

  const dateString = selectedDate 
    ? format(selectedDate, 'EEEE, MMMM d, yyyy')
    : 'Selected Date';

  // Render the add shift form
  if (isAddShiftFormOpen) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Shift</DialogTitle>
            <DialogDescription>
              Create an open shift on {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'the selected date'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={createOpenShift} className="space-y-4 pt-4">
            <div>
              <Label htmlFor="shift-title">Shift Title</Label>
              <Input 
                id="shift-title" 
                value={shiftTitle} 
                onChange={(e) => setShiftTitle(e.target.value)} 
                placeholder="e.g. Server, Bartender, etc."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-time">Start Time</Label>
                <Input 
                  id="start-time" 
                  type="time" 
                  value={startTime} 
                  onChange={(e) => setStartTime(e.target.value)} 
                />
              </div>
              <div>
                <Label htmlFor="end-time">End Time</Label>
                <Input 
                  id="end-time" 
                  type="time" 
                  value={endTime} 
                  onChange={(e) => setEndTime(e.target.value)} 
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="location">Location (Optional)</Label>
              <Input 
                id="location" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
                placeholder="e.g. Main Floor"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="include-break" 
                checked={includeBreak} 
                onCheckedChange={setIncludeBreak}
              />
              <Label htmlFor="include-break">Include Break</Label>
            </div>
            
            {includeBreak && (
              <div>
                <Label htmlFor="break-duration">Break Duration (minutes)</Label>
                <Input 
                  id="break-duration" 
                  type="number" 
                  min="15" 
                  max="60" 
                  step="5" 
                  value={breakDuration}
                  onChange={(e) => setBreakDuration(e.target.value)}
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea 
                id="notes" 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special instructions or requirements"
                className="min-h-[80px]"
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  resetAddShiftForm();
                  setIsAddShiftFormOpen(false);
                }}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : 'Create Open Shift'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }
  
  // Render the add employee form
  if (isAddEmployeeFormOpen) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>
              Create a new employee and optionally assign a shift
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAddNewEmployee} className="space-y-4 pt-4">
            <div>
              <Label htmlFor="employee-name">Employee Name*</Label>
              <Input 
                id="employee-name" 
                placeholder="Full Name"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="job-title">Job Title*</Label>
              <Input 
                id="job-title" 
                placeholder="e.g. Server, Manager, etc."
                required
              />
            </div>
            
            <div>
              <Label htmlFor="department">Department</Label>
              <Input 
                id="department" 
                placeholder="e.g. Kitchen, Front of House"
              />
            </div>
            
            <div>
              <Label htmlFor="hourly-rate">Hourly Rate</Label>
              <Input 
                id="hourly-rate" 
                type="number" 
                min="0" 
                step="0.01"
                placeholder="0.00"
              />
            </div>
            
            <div className="border-t pt-4 mt-4">
              <h3 className="font-medium mb-2">Initial Shift (Optional)</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-time-emp">Start Time</Label>
                  <Input 
                    id="start-time-emp" 
                    type="time" 
                    value={startTime} 
                    onChange={(e) => setStartTime(e.target.value)} 
                  />
                </div>
                <div>
                  <Label htmlFor="end-time-emp">End Time</Label>
                  <Input 
                    id="end-time-emp" 
                    type="time" 
                    value={endTime} 
                    onChange={(e) => setEndTime(e.target.value)} 
                  />
                </div>
              </div>
              
              <div className="mt-2">
                <Label htmlFor="location-emp">Location</Label>
                <Input 
                  id="location-emp" 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)} 
                  placeholder="e.g. Main Floor"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  resetAddEmployeeForm();
                  setIsAddEmployeeFormOpen(false);
                }}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : 'Add Employee'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }
  
  // Main menu dialog
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{dateString}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <Button
            onClick={openAddShiftForm}
            className="flex items-center justify-center gap-2 py-6 text-lg"
            disabled={!hasManagerAccess || isProcessing}
            variant="default"
          >
            {isProcessing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Calendar className="h-5 w-5" />
            )}
            Add shift
          </Button>
          
          <Button
            onClick={openAddEmployeeForm}
            className="flex items-center justify-center gap-2 py-6 text-lg bg-green-600 hover:bg-green-700"
            disabled={!hasManagerAccess || isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <UserPlus className="h-5 w-5" />
            )}
            Add employee
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DateActionMenu;
