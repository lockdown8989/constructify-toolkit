
import React, { useState, useEffect } from 'react';
import { format, addHours } from 'date-fns';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Clock, CalendarDays, MapPin, FileText, Calendar } from 'lucide-react';

interface AddShiftSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (formData: any) => void; 
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
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    role: '',
    date: format(currentDate, 'yyyy-MM-dd'),
    start_time: '09:00',
    end_time: '17:00',
    notes: '',
    location: ''
  });

  // Duration state
  const [duration, setDuration] = useState('8h 0m');
  const [publishToCalendar, setPublishToCalendar] = useState(true);

  // Update date when currentDate changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      date: format(currentDate, 'yyyy-MM-dd')
    }));
  }, [currentDate]);

  // Update duration when start or end time changes
  useEffect(() => {
    setDuration(calculateDuration());
  }, [formData.start_time, formData.end_time]);

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id.replace('shift-', '')]: value
    }));
  };

  // Calculate shift duration
  const calculateDuration = () => {
    try {
      const startParts = formData.start_time.split(':');
      const endParts = formData.end_time.split(':');
      
      if (startParts.length !== 2 || endParts.length !== 2) return "Invalid time format";
      
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
      return "Invalid time format";
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    // Validate required fields
    if (!formData.title) {
      toast({
        title: "Missing information",
        description: "Please enter a shift title",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Create ISO format datetime strings
      const startDateTime = new Date(`${formData.date}T${formData.start_time}`);
      const endDateTime = new Date(`${formData.date}T${formData.end_time}`);
      
      // Check for valid dates
      if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
        throw new Error("Invalid date format");
      }
      
      // If end time is earlier than start time, assume it's for the next day
      if (endDateTime < startDateTime) {
        endDateTime.setDate(endDateTime.getDate() + 1);
      }
      
      // Submit the processed form data
      onSubmit({
        title: formData.title,
        role: formData.role,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        notes: formData.notes,
        location: formData.location,
        published: publishToCalendar
      });
      
      // Reset form
      setFormData({
        title: '',
        role: '',
        date: format(currentDate, 'yyyy-MM-dd'),
        start_time: '09:00',
        end_time: '17:00',
        notes: '',
        location: ''
      });
      setPublishToCalendar(true);
    } catch (error) {
      console.error("Error formatting date:", error);
      toast({
        title: "Error",
        description: "There was an error processing the date and time",
        variant: "destructive"
      });
    }
  };

  // Handle direct duration editing
  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const durationMatch = value.match(/^(\d+)h\s*(\d*)m?$/);
    
    if (durationMatch) {
      const hours = parseInt(durationMatch[1]);
      const minutes = durationMatch[2] ? parseInt(durationMatch[2]) : 0;
      
      if (hours >= 0 && minutes >= 0 && minutes < 60) {
        // Parse current start time
        const startParts = formData.start_time.split(':');
        if (startParts.length === 2) {
          const startHour = parseInt(startParts[0]);
          const startMinute = parseInt(startParts[1]);
          
          // Calculate new end time
          let endHour = startHour + hours;
          let endMinute = startMinute + minutes;
          
          // Adjust for minute overflow
          if (endMinute >= 60) {
            endHour += Math.floor(endMinute / 60);
            endMinute %= 60;
          }
          
          // Handle day wrap
          if (endHour >= 24) {
            endHour %= 24;
          }
          
          // Format the new end time
          const newEndTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
          
          setFormData(prev => ({
            ...prev,
            end_time: newEndTime
          }));
          
          setDuration(`${hours}h ${minutes}m`);
          return;
        }
      }
    }
    
    // If the input doesn't match the expected format, just set the raw value and let validation handle it
    setDuration(value);
  };

  return (
    <Sheet open={isOpen} onOpenChange={() => onOpenChange(false)}>
      <SheetContent className={cn(
        isMobile ? "h-[85%] rounded-t-xl pb-0" : "max-w-md",
        "overflow-y-auto"
      )} side={isMobile ? "bottom" : "right"}>
        <SheetHeader className="pb-4">
          <SheetTitle>Add New Open Shift</SheetTitle>
          <SheetDescription>
            Create a new open shift for {format(currentDate, 'EEEE, MMMM d, yyyy')}
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-4 pb-20">
          <div className="space-y-2">
            <Label htmlFor="shift-title">Shift Title</Label>
            <Input 
              id="shift-title" 
              placeholder="e.g., Morning Shift"
              value={formData.title}
              onChange={handleChange}
            />
          </div>
          
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100 mb-3">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-700">Shift Date</span>
              </div>
              <span className="text-sm text-blue-600">{format(new Date(formData.date), 'MMMM d, yyyy')}</span>
            </div>
            
            <Input 
              type="date" 
              id="shift-date" 
              value={formData.date}
              onChange={handleChange}
              className="mb-2"
            />
          </div>
          
          <div className="bg-green-50 rounded-lg p-3 border border-green-100">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-green-700">Shift Hours</span>
              </div>
              <div className="flex items-center">
                <Label htmlFor="duration" className="text-xs mr-2 text-green-700">Duration:</Label>
                <Input 
                  id="duration"
                  value={duration}
                  onChange={handleDurationChange}
                  className="w-20 h-7 px-2 py-1 text-xs bg-white text-green-800"
                  placeholder="0h 0m"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="shift-start_time" className="text-xs">Start Time</Label>
                <Input 
                  type="time" 
                  id="shift-start_time" 
                  value={formData.start_time}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="shift-end_time" className="text-xs">End Time</Label>
                <Input 
                  type="time" 
                  id="shift-end_time" 
                  value={formData.end_time}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="shift-role">Role</Label>
            <select 
              id="shift-role" 
              className="w-full p-2 border rounded-md"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="">Select a role</option>
              <option value="waitstaff">Waiting Staff</option>
              <option value="chef">Chef</option>
              <option value="hostess">Host/Hostess</option>
              <option value="manager">Duty Manager</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <Label htmlFor="shift-location">Location</Label>
            </div>
            <Input 
              id="shift-location" 
              placeholder="e.g., Main Office"
              value={formData.location}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <Label htmlFor="shift-notes">Notes (Optional)</Label>
            </div>
            <textarea 
              id="shift-notes"
              className="w-full p-2 border rounded-md min-h-[80px]"
              placeholder="Add any notes about this shift"
              value={formData.notes}
              onChange={handleChange}
            />
          </div>
          
          <div className="flex items-center space-x-2 py-2 px-3 bg-blue-50 rounded-lg border border-blue-100">
            <input
              type="checkbox"
              id="publishToCalendar"
              checked={publishToCalendar}
              onChange={() => setPublishToCalendar(!publishToCalendar)}
              className="rounded text-blue-500 focus:ring-blue-500"
            />
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <Label htmlFor="publishToCalendar" className="text-sm text-blue-700 cursor-pointer">
                Publish to Calendar
              </Label>
            </div>
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
            onClick={handleSubmit} 
            className="flex-1 bg-blue-500 hover:bg-blue-600"
          >
            {publishToCalendar ? "Publish Shift" : "Create Shift"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AddShiftSheet;
