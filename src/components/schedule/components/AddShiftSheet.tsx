
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useEmployees } from "@/hooks/use-employees";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Clock, CalendarDays, MapPin } from "lucide-react";

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
    published: true,
    employee_id: ''
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    
    // Reset form errors when opening the sheet
    if (isOpen) {
      setFormErrors({});
    }
  }, [currentDate, isOpen]);

  const handleChange = (field: string, value: any) => {
    // Clear the error for this field when user changes it
    setFormErrors(prev => ({ ...prev, [field]: undefined }));
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    
    if (!formData.title.trim()) {
      errors.title = "Shift title is required";
    }

    if (!formData.start_time) {
      errors.start_time = "Start time is required";
    }

    if (!formData.end_time) {
      errors.end_time = "End time is required";
    } else if (formData.start_time && new Date(formData.start_time) >= new Date(formData.end_time)) {
      errors.end_time = "End time must be after start time";
    }

    return errors;
  };

  const handleSubmit = () => {
    console.log("Validating form data:", formData);
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      
      const errorMessage = Object.values(errors)[0];
      toast({
        title: "Validation error",
        description: errorMessage,
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Submit the form data
      onSubmit(formData);
      
      // Show success message
      toast({
        title: "Shift added",
        description: `Shift has been successfully added to the schedule.`,
        variant: "default"
      });
      
      // Reset form
      setFormData({
        title: '',
        role: '',
        start_time: '',
        end_time: '',
        notes: '',
        location: '',
        published: true,
        employee_id: ''
      });
      
      // Close the sheet
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: "Failed to add shift. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
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
        
        <div className="grid gap-4 py-4 overflow-y-auto" style={{ maxHeight: "calc(100% - 140px)" }}>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Shift Title"
              className={`col-span-3 ${formErrors.title ? 'border-red-500' : ''}`}
            />
            {formErrors.title && <p className="text-red-500 text-xs col-start-2 col-span-3">{formErrors.title}</p>}
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="employee" className="text-right">
              Employee
            </Label>
            <Select 
              value={formData.employee_id}
              onValueChange={(value) => handleChange('employee_id', value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select an employee (optional)" />
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
          
          <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
            <div className="flex items-center mb-2">
              <CalendarDays className="h-4 w-4 mr-2 text-blue-600" />
              <h4 className="text-sm font-medium text-blue-700">Shift Time</h4>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4 mb-2">
              <Label htmlFor="startTime" className="text-right text-blue-700">
                Start <span className="text-red-500">*</span>
              </Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => handleChange('start_time', e.target.value)}
                className={`col-span-3 ${formErrors.start_time ? 'border-red-500' : ''}`}
              />
              {formErrors.start_time && <p className="text-red-500 text-xs col-start-2 col-span-3">{formErrors.start_time}</p>}
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endTime" className="text-right text-blue-700">
                End <span className="text-red-500">*</span>
              </Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={formData.end_time}
                onChange={(e) => handleChange('end_time', e.target.value)}
                className={`col-span-3 ${formErrors.end_time ? 'border-red-500' : ''}`}
              />
              {formErrors.end_time && <p className="text-red-500 text-xs col-start-2 col-span-3">{formErrors.end_time}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="location" className="text-right">
              Location
            </Label>
            <div className="col-span-3 flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-gray-500" />
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="e.g. Main Office"
                className="flex-1"
              />
            </div>
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
              rows={3}
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
          
          {Object.keys(formErrors).length > 0 && (
            <Alert variant="destructive" className="mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please fix the errors before submitting.
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        <SheetFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? "Adding..." : "Add Shift"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default AddShiftSheet;
