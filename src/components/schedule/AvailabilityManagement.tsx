
import React, { useState } from 'react';
import { Clock, Save, Plus, Check, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';
import { useEmployees } from '@/hooks/use-employees';
import { useAvailabilityRequests, useCreateAvailabilityRequest } from '@/hooks/use-availability';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const AvailabilityManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: employees = [] } = useEmployees();
  const { data: availabilityRequests = [], isLoading } = useAvailabilityRequests();
  const { mutateAsync: createAvailabilityRequest, isPending } = useCreateAvailabilityRequest();
  
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [isAvailable, setIsAvailable] = useState(true);
  const [notes, setNotes] = useState('');
  
  // Get current employee
  const currentEmployee = user ? employees.find(emp => emp.user_id === user.id) : null;
  
  // Filter availability requests to show only the current employee's
  const employeeAvailabilityRequests = currentEmployee 
    ? availabilityRequests.filter(req => req.employee_id === currentEmployee.id)
    : [];
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentEmployee) {
      toast({
        title: "Error",
        description: "Employee record not found.",
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
      
      // Reset form
      setShowForm(false);
      setDate(new Date());
      setStartTime('09:00');
      setEndTime('17:00');
      setIsAvailable(true);
      setNotes('');
      
    } catch (error) {
      console.error("Error submitting availability:", error);
      toast({
        title: "Error",
        description: "Failed to submit availability. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Approved</Badge>;
      case 'Rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
    }
  };
  
  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">Please sign in to manage your availability.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5" />
            Availability Management
          </CardTitle>
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Set Availability
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <p>Loading availability data...</p>
          </div>
        ) : employeeAvailabilityRequests.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <p>No availability preferences set.</p>
            <p className="text-sm mt-2">
              Set your preferred working hours to help your manager schedule shifts more effectively.
            </p>
          </div>
        ) : (
          <div className="space-y-3 mt-2">
            {employeeAvailabilityRequests.map((request) => (
              <div key={request.id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">
                      {format(new Date(request.date), 'EEEE, MMMM d, yyyy')}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      <Clock className="h-3.5 w-3.5 inline mr-1" />
                      {request.start_time} - {request.end_time}
                    </div>
                    {request.notes && (
                      <div className="text-sm text-gray-500 mt-1">
                        Note: {request.notes}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end">
                    {getStatusBadge(request.status)}
                    <span className="text-sm mt-1">
                      {request.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Set Availability</DialogTitle>
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
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                <Save className="h-4 w-4 mr-1" />
                Submit
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AvailabilityManagement;
