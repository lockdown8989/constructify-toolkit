
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ShiftAddDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (shiftData: {
    startTime: string;
    endTime: string;
    title: string;
    notes?: string;
  }) => void;
  employeeName: string;
  day: string;
  defaultAvailability?: {
    startTime: string;
    endTime: string;
  };
  isLoading?: boolean;
}

const ShiftAddDialog: React.FC<ShiftAddDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  employeeName,
  day,
  defaultAvailability,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
    title: '',
    notes: ''
  });

  useEffect(() => {
    if (isOpen && defaultAvailability) {
      setFormData({
        startTime: defaultAvailability.startTime.substring(0, 5),
        endTime: defaultAvailability.endTime.substring(0, 5),
        title: `${day.charAt(0).toUpperCase() + day.slice(1)} Shift`,
        notes: ''
      });
    }
  }, [isOpen, defaultAvailability, day]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Shift</DialogTitle>
            <DialogDescription>
              Add a new shift for {employeeName} on {day.charAt(0).toUpperCase() + day.slice(1)}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleChange('startTime', e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleChange('endTime', e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="title">Shift Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g., Morning Shift, Customer Service"
                required
              />
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Add any additional notes for this shift"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Shift'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ShiftAddDialog;
