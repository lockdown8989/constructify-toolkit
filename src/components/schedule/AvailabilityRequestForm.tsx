
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useCreateAvailabilityRequest } from '@/hooks/availability/use-create-availability';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export interface AvailabilityRequestFormProps {
  onClose?: () => void;
}

const AvailabilityRequestForm: React.FC<AvailabilityRequestFormProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [date, setDate] = useState<Date>();
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [notes, setNotes] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { createRequest, isLoading } = useCreateAvailabilityRequest();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !date || !startTime || !endTime) {
      toast({
        title: "Missing Information",
        description: "Please fill out all required fields",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Get employee ID
      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .single();
        
      if (!employee?.id) {
        toast({
          title: "Error",
          description: "Could not find your employee record",
          variant: "destructive"
        });
        return;
      }
      
      const result = await createRequest({
        employee_id: employee.id,
        date: format(date, 'yyyy-MM-dd'),
        start_time: startTime,
        end_time: endTime,
        is_available: isAvailable,
        notes: notes || undefined
      });
      
      if (result.success) {
        toast({
          title: "Request Submitted",
          description: "Your availability request has been submitted"
        });
        
        // Clear form
        setDate(undefined);
        setStartTime('');
        setEndTime('');
        setIsAvailable(true);
        setNotes('');
        
        // Refresh data
        queryClient.invalidateQueries({ queryKey: ['availability-requests'] });
        
        // Close form if provided
        if (onClose) {
          onClose();
        }
      }
    } catch (error) {
      console.error('Error submitting availability request:', error);
      toast({
        title: "Error",
        description: "Failed to submit availability request",
        variant: "destructive"
      });
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : "Select date"}
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
          <div className="relative">
            <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="startTime"
              type="time"
              className="pl-9"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="endTime">End Time</Label>
          <div className="relative">
            <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="endTime"
              type="time"
              className="pl-9"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              required
            />
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="isAvailable"
          checked={isAvailable}
          onCheckedChange={setIsAvailable}
        />
        <Label htmlFor="isAvailable">
          {isAvailable ? "Available" : "Not Available"}
        </Label>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Add any additional information..."
          className="min-h-[80px]"
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        {onClose && (
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Submitting..." : "Submit"}
        </Button>
      </div>
    </form>
  );
};

export default AvailabilityRequestForm;
