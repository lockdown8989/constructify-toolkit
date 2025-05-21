
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

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

  // Update date when currentDate changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      date: format(currentDate, 'yyyy-MM-dd')
    }));
  }, [currentDate]);

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id.replace('shift-', '')]: value
    }));
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
      
      // Submit the processed form data
      onSubmit({
        title: formData.title,
        role: formData.role,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        notes: formData.notes,
        location: formData.location
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
    } catch (error) {
      console.error("Error formatting date:", error);
      toast({
        title: "Error",
        description: "There was an error processing the date and time",
        variant: "destructive"
      });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className={cn(
        isMobile ? "h-[80%] rounded-t-xl pb-0" : "max-w-md",
        "overflow-y-auto"
      )} side={isMobile ? "bottom" : "right"}>
        <SheetHeader className="pb-4">
          <SheetTitle>Add New Open Shift</SheetTitle>
          <SheetDescription>Create a new open shift on the schedule</SheetDescription>
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
          
          <div className="space-y-2">
            <Label htmlFor="shift-date">Date</Label>
            <Input 
              type="date" 
              id="shift-date" 
              value={formData.date}
              onChange={handleChange}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="shift-start_time">Start Time</Label>
              <Input 
                type="time" 
                id="shift-start_time" 
                value={formData.start_time}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shift-end_time">End Time</Label>
              <Input 
                type="time" 
                id="shift-end_time" 
                value={formData.end_time}
                onChange={handleChange}
              />
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
            <Label htmlFor="shift-location">Location</Label>
            <Input 
              id="shift-location" 
              placeholder="e.g., Main Office"
              value={formData.location}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="shift-notes">Notes (Optional)</Label>
            <textarea 
              id="shift-notes"
              className="w-full p-2 border rounded-md min-h-[80px]"
              placeholder="Add any notes about this shift"
              value={formData.notes}
              onChange={handleChange}
            />
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
            className="flex-1"
          >
            Add Shift
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AddShiftSheet;
