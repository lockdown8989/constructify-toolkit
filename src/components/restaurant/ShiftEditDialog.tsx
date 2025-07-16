
import { useState, useEffect } from 'react';
import { Shift } from '@/types/restaurant-schedule';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ShiftEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  shift?: Shift | null;
  onSave: (shift: Shift) => void;
  onDelete?: (shift: Shift) => void;
  mode?: 'add' | 'edit';
}

const ShiftEditDialog = ({ 
  isOpen, 
  onClose, 
  shift, 
  onSave, 
  onDelete,
  mode = 'edit' 
}: ShiftEditDialogProps) => {
  const [editedShift, setEditedShift] = useState<Shift | null>(null);
  
  // Set the form data when a shift is provided
  useEffect(() => {
    if (shift) {
      setEditedShift({ ...shift });
    } else {
      // Initialize with default values for add mode
      setEditedShift({
        id: '',
        employeeId: '',
        day: '',
        startTime: '',
        endTime: '',
        role: '',
        hasBreak: false,
        breakDuration: 30,
        isUnavailable: false
      });
    }
  }, [shift, isOpen]);
  
  if (!editedShift) {
    return null;
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editedShift) {
      onSave(editedShift);
      onClose();
    }
  };
  
  const handleChange = (field: keyof Shift, value: any) => {
    setEditedShift(prev => {
      if (!prev) return null;
      return { ...prev, [field]: value };
    });
  };

  const handleDelete = () => {
    if (editedShift && onDelete) {
      onDelete(editedShift);
      onClose();
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{mode === 'edit' ? 'Edit Shift' : 'Add Shift'}</DialogTitle>
            <DialogDescription>
              {mode === 'edit' ? 'Update the shift details below.' : 'Enter the details for the new shift.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  value={editedShift.startTime}
                  onChange={(e) => handleChange('startTime', e.target.value)}
                  placeholder="HH:MM"
                  required
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  value={editedShift.endTime}
                  onChange={(e) => handleChange('endTime', e.target.value)}
                  placeholder="HH:MM"
                  required
                />
              </div>
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={editedShift.role}
                onChange={(e) => handleChange('role', e.target.value)}
                placeholder="Role title"
                required
              />
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={editedShift.notes || ''}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Add any notes about this shift"
                rows={3}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="hasBreak"
                checked={editedShift.hasBreak || false}
                onCheckedChange={(checked) => handleChange('hasBreak', checked)}
              />
              <Label htmlFor="hasBreak">Include break</Label>
            </div>
            
            {editedShift.hasBreak && (
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="breakDuration">Break Duration (minutes)</Label>
                <Input
                  id="breakDuration"
                  type="number"
                  value={editedShift.breakDuration || 30}
                  onChange={(e) => handleChange('breakDuration', Number(e.target.value))}
                  min={5}
                  max={120}
                />
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Switch
                id="isUnavailable"
                checked={editedShift.isUnavailable || false}
                onCheckedChange={(checked) => handleChange('isUnavailable', checked)}
              />
              <Label htmlFor="isUnavailable">Mark as unavailable</Label>
            </div>
            
            {editedShift.isUnavailable && (
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="unavailabilityReason">Reason</Label>
                <Select
                  value={editedShift.unavailabilityReason || 'vacation'}
                  onValueChange={(value) => handleChange('unavailabilityReason', value)}
                >
                  <SelectTrigger id="unavailabilityReason">
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vacation">Vacation</SelectItem>
                    <SelectItem value="sick">Sick Leave</SelectItem>
                    <SelectItem value="personal">Personal Leave</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <DialogFooter className="flex justify-between">
            <div className="flex space-x-2">
              {mode === 'edit' && onDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Shift</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this shift? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete Shift
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            
            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ShiftEditDialog;
