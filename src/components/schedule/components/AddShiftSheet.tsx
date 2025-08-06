
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
import { AlertCircle, Clock, CalendarDays, MapPin, Send, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
  const [formData, setFormData] = useState({
    title: '',
    role: '',
    start_time: '',
    end_time: '',
    notes: '',
    location: '',
    published: true,
    employee_id: '',
    department: '',
    shift_type: 'regular'
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const { toast } = useToast();
  const { data: employees = [] } = useEmployees({});

  // Initialize times when the date changes
  useEffect(() => {
    const defaultStartHour = 9;
    const defaultEndHour = 17;
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    
    setFormData(prev => ({
      ...prev,
      title: prev.title || '',
      start_time: `${dateStr}T${String(defaultStartHour).padStart(2, '0')}:00:00`,
      end_time: `${dateStr}T${String(defaultEndHour).padStart(2, '0')}:00:00`
    }));
    
    if (isOpen) {
      setFormErrors({});
      setShowSuccessAnimation(false);
    }
  }, [currentDate, isOpen]);

  const handleChange = (field: string, value: any) => {
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

  const handleSubmit = async () => {
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
      // Show success animation
      setShowSuccessAnimation(true);
      
      // If no employee is selected, create as published open shift
      if (!formData.employee_id) {
        const { data: openShiftData, error: openShiftError } = await supabase
          .from('open_shifts')
          .insert({
            title: formData.title,
            role: formData.role || formData.title,
            start_time: formData.start_time,
            end_time: formData.end_time,
            location: formData.location || null,
            notes: formData.notes || 'Available for pickup',
            status: 'open',
            department: formData.department || null,
            priority: 'normal',
            created_platform: 'desktop',
            mobile_notification_sent: false
          })
          .select()
          .single();

        if (openShiftError) throw openShiftError;

        toast({
          title: "🎉 Open Shift Created!",
          description: "The shift has been published and is now available for employees to claim in the Open Shifts section.",
          variant: "default"
        });
      } else {
        // Create regular schedule for assigned employee
        const { data: scheduleData, error: scheduleError } = await supabase
          .from('schedules')
          .insert({
            employee_id: formData.employee_id,
            title: formData.title,
            start_time: formData.start_time,
            end_time: formData.end_time,
            notes: formData.notes,
            location: formData.location,
            published: true,
            status: 'confirmed',
            shift_type: formData.shift_type,
            created_platform: 'desktop',
            mobile_notification_sent: false
          })
          .select()
          .single();

        if (scheduleError) throw scheduleError;
        
        toast({
          title: "✅ Shift Assigned!",
          description: "The shift has been assigned and published to the employee.",
          variant: "default"
        });
      }

      // Wait for animation to complete
      setTimeout(() => {
        // Reset form
        setFormData({
          title: '',
          role: '',
          start_time: '',
          end_time: '',
          notes: '',
          location: '',
          published: true,
          employee_id: '',
          department: '',
          shift_type: 'regular'
        });
        
        // Close the sheet
        onOpenChange(false);
        
        // Refresh the parent component
        if (onSubmit) {
          onSubmit({ success: true });
        }
        
        setShowSuccessAnimation(false);
      }, 1500);
      
    } catch (error) {
      console.error("Error creating shift:", error);
      toast({
        title: "Error",
        description: "Failed to create shift. Please try again.",
        variant: "destructive"
      });
      setShowSuccessAnimation(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side={isMobile ? "bottom" : "right"} className={isMobile ? "h-[90vh]" : ""}>
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-green-600" />
            Create Published Shift
          </SheetTitle>
          <SheetDescription>
            Create a new shift for {format(currentDate, 'MMMM d, yyyy')} that will be published to employees
          </SheetDescription>
        </SheetHeader>
        
        {showSuccessAnimation && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl animate-scale-in">
              <div className="flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-green-500 animate-pulse" />
                <span className="text-lg font-medium">Shift Created Successfully!</span>
              </div>
            </div>
          </div>
        )}
        
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
              Assign to
            </Label>
             <Select 
               value={formData.employee_id || 'open'}
               onValueChange={(value) => handleChange('employee_id', value === 'open' ? '' : value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Leave empty for open shift" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Create as Open Shift</SelectItem>
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
              placeholder="e.g. Sales Associate"
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="department" className="text-right">
              Department
            </Label>
            <Select 
              value={formData.department}
              onValueChange={(value) => handleChange('department', value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Sales">Sales</SelectItem>
                <SelectItem value="Customer Service">Customer Service</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Operations">Operations</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
              </SelectContent>
            </Select>
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
              placeholder="Available for pickup"
              className="col-span-3"
              rows={3}
            />
          </div>
          
          <div className="bg-green-50 p-3 rounded-md border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-green-700">Auto-Publish to Employees</h4>
                <p className="text-xs text-green-600">
                  {!formData.employee_id 
                    ? "This shift will be published as an open shift for employees to claim"
                    : "This shift will be immediately visible to the assigned employee"
                  }
                </p>
              </div>
              <div className="flex items-center">
                <Switch
                  id="published"
                  checked={formData.published}
                  onCheckedChange={(checked) => handleChange('published', checked)}
                />
              </div>
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
            className="bg-green-600 hover:bg-green-700 text-white transition-all duration-200"
          >
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? "Publishing..." : 
             !formData.employee_id ? "Publish Open Shift" : "Publish Shift"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default AddShiftSheet;
