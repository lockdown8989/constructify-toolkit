
import React, { useState, useEffect } from 'react';
import { useShiftSwaps, useCreateShiftSwap, useUpdateShiftSwap } from '@/hooks/use-shift-swaps';
import { useEmployees } from '@/hooks/use-employees';
import { useSchedules } from '@/hooks/use-schedules';
import { useAuth } from '@/hooks/use-auth';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, SwapHorizontal, ArrowLeftRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ShiftSwapList from './ShiftSwapList';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

const ShiftSwapTab = () => {
  const { data: swaps = [], isLoading: isLoadingSwaps } = useShiftSwaps();
  const { data: schedules = [], isLoading: isLoadingSchedules } = useSchedules();
  const { data: employees = [], isLoading: isLoadingEmployees } = useEmployees();
  const { user } = useAuth();
  const { mutate: createSwap } = useCreateShiftSwap();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>('');
  const [recipientEmployeeId, setRecipientEmployeeId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  
  // Filter to show only the current user's schedules
  const mySchedules = schedules.filter(schedule => schedule.employee_id === user?.id);
  
  // Get current employee's data
  const currentEmployee = user?.id ? employees.find(emp => emp.user_id === user.id) : null;
  
  const handleSwapRequest = () => {
    if (!selectedScheduleId || !recipientEmployeeId) {
      toast({
        title: "Cannot create swap request",
        description: "Please select both a shift and an employee to swap with.",
        variant: "destructive"
      });
      return;
    }
    
    createSwap({
      requester_id: currentEmployee?.id || '',
      recipient_id: recipientEmployeeId,
      requester_schedule_id: selectedScheduleId,
      notes: notes || undefined
    });
    
    // Clear form
    setSelectedScheduleId('');
    setRecipientEmployeeId('');
    setNotes('');
  };
  
  // Group shifts by date
  const shiftsByDate: Record<string, any[]> = {};
  mySchedules.forEach(schedule => {
    const dateKey = format(new Date(schedule.start_time), 'yyyy-MM-dd');
    if (!shiftsByDate[dateKey]) {
      shiftsByDate[dateKey] = [];
    }
    shiftsByDate[dateKey].push(schedule);
  });
  
  // Get available employees (excluding current user)
  const availableEmployees = employees.filter(emp => emp.id !== currentEmployee?.id);
  
  if (!currentEmployee) {
    return (
      <Card className="border rounded-xl shadow-sm overflow-hidden mb-4">
        <CardContent className="pt-6 text-center">
          <p className="text-gray-500">Please sign in to request shift swaps</p>
        </CardContent>
      </Card>
    );
  }
  
  const scheduleOptions = Object.keys(shiftsByDate).map(dateKey => {
    const shifts = shiftsByDate[dateKey];
    const dateDisplay = format(new Date(dateKey), 'EEE, MMM d');
    
    return (
      <optgroup key={dateKey} label={dateDisplay}>
        {shifts.map(shift => (
          <option key={shift.id} value={shift.id}>
            {format(parseISO(shift.start_time), 'h:mm a')} - {format(parseISO(shift.end_time), 'h:mm a')} ({shift.title})
          </option>
        ))}
      </optgroup>
    );
  });
  
  const newRequestContent = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="shift">Select your shift to swap</Label>
        <select
          id="shift"
          className="w-full p-2 border rounded-md"
          value={selectedScheduleId}
          onChange={(e) => setSelectedScheduleId(e.target.value)}
        >
          <option value="">Select a shift</option>
          {scheduleOptions}
        </select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="employee">Employee to swap with</Label>
        <select
          id="employee"
          className="w-full p-2 border rounded-md"
          value={recipientEmployeeId}
          onChange={(e) => setRecipientEmployeeId(e.target.value)}
        >
          <option value="">Select an employee</option>
          {availableEmployees.map(employee => (
            <option key={employee.id} value={employee.id}>{employee.name}</option>
          ))}
        </select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Reason for swap request (optional)</Label>
        <textarea
          id="notes"
          className="w-full p-2 border rounded-md min-h-[80px]"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Explain why you need to swap shifts"
        />
      </div>
      
      <div className="pt-2">
        <Button 
          onClick={handleSwapRequest} 
          className="w-full"
          disabled={!selectedScheduleId || !recipientEmployeeId}
        >
          <SwapHorizontal className="mr-2 h-4 w-4" />
          Request Shift Swap
        </Button>
      </div>
    </div>
  );
  
  return (
    <div className="space-y-6">
      {isMobile ? (
        <Sheet>
          <SheetTrigger asChild>
            <Button className="w-full">
              <SwapHorizontal className="mr-2 h-4 w-4" />
              New Shift Swap Request
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80%] rounded-t-xl">
            <SheetHeader className="text-left">
              <SheetTitle>New Shift Swap Request</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              {newRequestContent}
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <Card className="border rounded-xl shadow-sm overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <SwapHorizontal className="mr-2 h-5 w-5 text-blue-500" />
              New Shift Swap Request
            </CardTitle>
            <CardDescription>
              Request to swap your shift with another employee
            </CardDescription>
          </CardHeader>
          <CardContent>
            {newRequestContent}
          </CardContent>
        </Card>
      )}
      
      <div>
        <h3 className="text-lg font-medium mb-3 flex items-center">
          <ArrowLeftRight className="mr-2 h-5 w-5" />
          Your Shift Swap Requests
        </h3>
        <ShiftSwapList />
      </div>
    </div>
  );
};

export default ShiftSwapTab;
