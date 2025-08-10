
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useEmployees } from '@/hooks/use-employees';
import { useSchedules } from '@/hooks/use-schedules';
import { useCreateShiftSwap } from '@/hooks/use-shift-swaps';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'react-router-dom';

const ShiftSwapForm = () => {
  const { user } = useAuth();
  const { data: schedules = [] } = useSchedules();
  const { data: allEmployees = [] } = useEmployees();
  const { mutate: createShiftSwap, isPending } = useCreateShiftSwap();
  const { toast } = useToast();
  const location = useLocation();
  
  const [selectedSchedule, setSelectedSchedule] = useState<string>('');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedRecipientSchedule, setSelectedRecipientSchedule] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [recipientSchedules, setRecipientSchedules] = useState<typeof schedules>([]);
  
  // Check location state for initial schedule
  useEffect(() => {
    if (location.state?.initialSchedule?.id) {
      setSelectedSchedule(location.state.initialSchedule.id);
    }
  }, [location.state]);

  // Get current user's employee record
  const currentUserEmployee = user 
    ? allEmployees.find(employee => employee.user_id === user.id)
    : null;

  // Filter employee's schedules
  const userSchedules = currentUserEmployee 
    ? schedules.filter(schedule => schedule.employee_id === currentUserEmployee.id)
    : [];
  
  // Filter potential recipients - exclude current user and only show active employees
  const potentialRecipients = currentUserEmployee 
    ? allEmployees.filter(employee => 
        employee.id !== currentUserEmployee.id && 
        employee.status === 'Active' &&
        employee.user_id // Only include employees with user accounts
      )
    : [];
  
  console.log('Current user employee:', currentUserEmployee);
  console.log('All employees:', allEmployees);
  console.log('Potential recipients:', potentialRecipients);
  
  // Filter schedules for selected recipient
  useEffect(() => {
    if (selectedEmployee) {
      const filteredSchedules = schedules.filter(schedule => schedule.employee_id === selectedEmployee);
      setRecipientSchedules(filteredSchedules);
      setSelectedRecipientSchedule(''); // Reset recipient schedule when employee changes
    } else {
      setRecipientSchedules([]);
    }
  }, [selectedEmployee, schedules]);
  
  // Format schedule display
  const formatScheduleOption = (schedule: typeof schedules[0]) => {
    const startTime = new Date(schedule.start_time);
    const endTime = new Date(schedule.end_time);
    
    return `${schedule.title} (${format(startTime, 'PPP')}, ${format(startTime, 'h:mm a')} - ${format(endTime, 'h:mm a')})`;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !currentUserEmployee) {
      toast({
        title: "Error",
        description: "You must be signed in with an employee account to request a shift swap",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedSchedule || !selectedEmployee) {
      toast({
        title: "Error",
        description: "Please select your shift and a colleague to swap with",
        variant: "destructive",
      });
      return;
    }
    
    createShiftSwap({
      requester_id: currentUserEmployee.id,
      recipient_id: selectedEmployee,
      requester_schedule_id: selectedSchedule,
      recipient_schedule_id: selectedRecipientSchedule || undefined,
      notes: notes || undefined,
      status: 'Pending'
    });
    
    // Reset form after submission
    setSelectedSchedule('');
    setSelectedEmployee('');
    setSelectedRecipientSchedule('');
    setNotes('');
  };
  
  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            Please sign in to request a shift swap
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentUserEmployee) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            No employee record found for your account. Please contact your manager.
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Shift Swap</CardTitle>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="schedule">Your Shift</Label>
            <Select 
              value={selectedSchedule} 
              onValueChange={setSelectedSchedule}
            >
              <SelectTrigger id="schedule">
                <SelectValue placeholder="Select your shift to swap" />
              </SelectTrigger>
              <SelectContent>
                {userSchedules.length > 0 ? (
                  userSchedules.map(schedule => (
                    <SelectItem key={schedule.id} value={schedule.id}>
                      {formatScheduleOption(schedule)}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No shifts available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="employee">Swap With</Label>
            <Select 
              value={selectedEmployee} 
              onValueChange={setSelectedEmployee}
            >
              <SelectTrigger id="employee">
                <SelectValue placeholder="Select a colleague" />
              </SelectTrigger>
              <SelectContent>
                {potentialRecipients.length > 0 ? (
                  potentialRecipients.map(employee => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No colleagues available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {potentialRecipients.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No other active employees found with user accounts
              </p>
            )}
          </div>
          
          {selectedEmployee && (
            <div className="space-y-2">
              <Label htmlFor="recipientSchedule">
                Their Shift (Optional)
              </Label>
              <Select 
                value={selectedRecipientSchedule || ''} 
                onValueChange={(val) => setSelectedRecipientSchedule(val === '__none__' ? '' : val)}
              >
                <SelectTrigger id="recipientSchedule">
                  <SelectValue placeholder="Select their shift (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No specific shift</SelectItem>
                  {recipientSchedules.length > 0 ? (
                    recipientSchedules.map(schedule => (
                      <SelectItem key={schedule.id} value={schedule.id}>
                        {formatScheduleOption(schedule)}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No shifts available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add additional details about your swap request"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
        
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Submitting..." : "Request Swap"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ShiftSwapForm;
