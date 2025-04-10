
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Save, CalendarIcon, Clock, Check, X } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useEmployees } from '@/hooks/use-employees';
// Use the refactored hooks
import { useCreateAvailabilityRequest } from '@/hooks/availability';
import { cn } from '@/lib/utils';

interface AvailabilityRequestFormProps {
  onClose: () => void;
}

const AvailabilityRequestForm = ({ onClose }: AvailabilityRequestFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: employees = [], isLoading: employeesLoading } = useEmployees();
  const { mutateAsync: createAvailabilityRequest, isPending } = useCreateAvailabilityRequest();
  
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [isAvailable, setIsAvailable] = useState(true);
  const [notes, setNotes] = useState('');
  
  // Get current employee
  const currentEmployee = user ? employees.find(emp => emp.user_id === user.id) : null;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentEmployee) {
      console.error('No employee record found for current user');
      toast({
        title: "Error",
        description: "Employee record not found. Please contact your administrator.",
        variant: "destructive",
      });
      return;
    }
    
    if (!date) {
      toast({
        title: "Error",
        description: "Please select a date.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      console.log('Submitting availability request', {
        employee_id: currentEmployee.id,
        date: format(date, 'yyyy-MM-dd'),
        start_time: startTime,
        end_time: endTime,
        is_available: isAvailable,
        notes: notes || null
      });
      
      await createAvailabilityRequest({
        employee_id: currentEmployee.id,
        date: format(date, 'yyyy-MM-dd'),
        start_time: startTime,
        end_time: endTime,
        is_available: isAvailable,
        notes: notes || null
      });
      
      toast({
        title: "Success",
        description: `Availability ${isAvailable ? 'set' : 'blocked'} for ${format(date, 'MMMM d, yyyy')}.`,
      });
      
      onClose();
      
    } catch (error: any) {
      console.error("Error submitting availability:", error);
      toast({
        title: "Error",
        description: `Failed to submit availability: ${error.message || "Please try again."}`,
        variant: "destructive",
      });
    }
  };
  
  if (employeesLoading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent>
          <div className="flex justify-center items-center py-8">
            <p>Loading employee data...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  if (!currentEmployee) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
            <DialogDescription>
              No employee record found for your account. Please contact your administrator.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set Availability</DialogTitle>
          <DialogDescription>
            Submit your availability for scheduling purposes.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  id="date"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Label htmlFor="availability">Availability Status</Label>
              <div className="flex-1"></div>
              <Button 
                type="button" 
                variant={isAvailable ? "default" : "outline"}
                size="sm" 
                className={cn("gap-1", isAvailable && "bg-green-600 hover:bg-green-700")}
                onClick={() => setIsAvailable(true)}
              >
                <Check className="h-4 w-4" />
                Available
              </Button>
              <Button 
                type="button" 
                variant={!isAvailable ? "default" : "outline"}
                size="sm" 
                className={cn("gap-1", !isAvailable && "bg-red-600 hover:bg-red-700")}
                onClick={() => setIsAvailable(false)}
              >
                <X className="h-4 w-4" />
                Unavailable
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional information about your availability..."
              className="min-h-[80px]"
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" />
                  Submit
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AvailabilityRequestForm;
