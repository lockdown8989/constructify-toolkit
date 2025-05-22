
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useEmployees } from "@/hooks/use-employees";

interface AddShiftSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (formData: any) => void;
  currentDate: Date;
  isMobile: boolean;
}

const AddShiftSheet: React.FC<AddShiftSheetProps> = ({ isOpen, onOpenChange, onSubmit, currentDate, isMobile }) => {
  const [formData, setFormData] = useState({
    title: '',
    role: '',
    start_time: '',
    end_time: '',
    notes: '',
    location: '',
    published: true
  });
  const { toast } = useToast();
  const { data: employees = [] } = useEmployees({});

  // Initialize times when the date changes
  useEffect(() => {
    const defaultStartHour = 9;
    const defaultEndHour = 17;
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    
    setFormData(prev => ({
      ...prev,
      start_time: `${dateStr}T${String(defaultStartHour).padStart(2, '0')}:00:00`,
      end_time: `${dateStr}T${String(defaultEndHour).padStart(2, '0')}:00:00`
    }));
  }, [currentDate]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    console.log("Submitting form data:", formData);
    
    // Validate form
    if (!formData.title) {
      toast({
        title: "Missing information",
        description: "Please provide a shift title",
        variant: "destructive"
      });
      return;
    }

    if (!formData.start_time || !formData.end_time) {
      toast({
        title: "Missing information",
        description: "Please set both start and end times",
        variant: "destructive"
      });
      return;
    }

    // Submit the form data
    onSubmit(formData);
    
    // Reset form
    setFormData({
      title: '',
      role: '',
      start_time: '',
      end_time: '',
      notes: '',
      location: '',
      published: true
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side={isMobile ? "bottom" : "right"} className={isMobile ? "h-[80vh]" : ""}>
        <SheetHeader>
          <SheetTitle>Add New Shift</SheetTitle>
          <SheetDescription>
            Create a new shift for {format(currentDate, 'MMMM d, yyyy')}
          </SheetDescription>
        </SheetHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Shift Title"
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Role
            </Label>
            <Input
              id="role"
              value={formData.role}
              onChange={(e) => handleChange('role', e.target.value)}
              placeholder="e.g. Front Desk, Cook"
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startTime" className="text-right">
              Start Time
            </Label>
            <Input
              id="startTime"
              type="datetime-local"
              value={formData.start_time}
              onChange={(e) => handleChange('start_time', e.target.value)}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endTime" className="text-right">
              End Time
            </Label>
            <Input
              id="endTime"
              type="datetime-local"
              value={formData.end_time}
              onChange={(e) => handleChange('end_time', e.target.value)}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="location" className="text-right">
              Location
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="e.g. Main Office"
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">
              Notes
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Any additional information"
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="published" className="text-right">
              Publish to Calendar
            </Label>
            <div className="col-span-3 flex items-center">
              <Switch
                id="published"
                checked={formData.published}
                onCheckedChange={(checked) => handleChange('published', checked)}
              />
              <span className="ml-2 text-sm text-gray-500">
                {formData.published ? "Will appear on calendar" : "Draft only"}
              </span>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Add Shift
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AddShiftSheet;
