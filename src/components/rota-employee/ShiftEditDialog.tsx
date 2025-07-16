
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
import { format } from 'date-fns';

interface Shift {
  id: string;
  start_time: string;
  end_time: string;
  title: string;
  notes?: string;
}

interface ShiftEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (shiftData: {
    startTime: string;
    endTime: string;
    title: string;
    notes?: string;
  }) => void;
  shift: Shift | null;
  employeeName: string;
  day: string;
  isLoading?: boolean;
}

const ShiftEditDialog: React.FC<ShiftEditDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  shift,
  employeeName,
  day,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
    title: '',
    notes: ''
  });

  useEffect(() => {
    if (isOpen && shift) {
      setFormData({
        startTime: format(new Date(shift.start_time), 'HH:mm'),
        endTime: format(new Date(shift.end_time), 'HH:mm'),
        title: shift.title,
        notes: shift.notes || ''
      });
    }
  }, [isOpen, shift]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!shift) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Shift</DialogTitle>
            <DialogDescription>
              Edit the shift for {employeeName} on {day.charAt(0).toUpperCase() + day.slice(1)}.
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
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ShiftEditDialog;
