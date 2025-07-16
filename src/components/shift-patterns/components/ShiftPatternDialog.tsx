import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShiftTemplate } from '@/types/schedule';
import { EmployeeAssignment } from './EmployeeAssignment';

export interface ShiftPatternFormData {
  name: string;
  start_time: string;
  end_time: string;
  break_duration: number;
  days_of_week: number[];
  requirements: Record<string, any>;
  role?: string;
  location?: string;
}

interface ShiftPatternDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingPattern: ShiftTemplate | null;
  formData: ShiftPatternFormData;
  onFormDataChange: (data: ShiftPatternFormData) => void;
  employees: any[];
  selectedEmployees: string[];
  selectedEmployeeId: string;
  onEmployeeIdChange: (id: string) => void;
  onAddEmployee: () => void;
  onRemoveEmployee: (employeeId: string) => void;
  getEmployeeName: (employeeId: string) => string;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export const ShiftPatternDialog = ({
  isOpen,
  onClose,
  editingPattern,
  formData,
  onFormDataChange,
  employees,
  selectedEmployees,
  selectedEmployeeId,
  onEmployeeIdChange,
  onAddEmployee,
  onRemoveEmployee,
  getEmployeeName,
  onSubmit,
  isLoading,
}: ShiftPatternDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {editingPattern ? 'Edit Shift Pattern' : 'Create Shift Pattern'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <Label htmlFor="name" className="text-sm font-medium">Pattern Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => onFormDataChange({...formData, name: e.target.value})}
              placeholder="e.g., Morning Shift, Afternoon Shift"
              required
              className="mt-1"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_time" className="text-sm font-medium">Start Time</Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => onFormDataChange({...formData, start_time: e.target.value})}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="end_time" className="text-sm font-medium">End Time</Label>
              <Input
                id="end_time"
                type="time"
                value={formData.end_time}
                onChange={(e) => onFormDataChange({...formData, end_time: e.target.value})}
                required
                className="mt-1"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="break_duration" className="text-sm font-medium">Break Duration (minutes)</Label>
            <Input
              id="break_duration"
              type="number"
              value={formData.break_duration}
              onChange={(e) => onFormDataChange({...formData, break_duration: parseInt(e.target.value)})}
              min="0"
              className="mt-1"
            />
          </div>

          {/* Employee Assignment Section - Only show when editing */}
          {editingPattern && (
            <EmployeeAssignment
              employees={employees}
              selectedEmployees={selectedEmployees}
              selectedEmployeeId={selectedEmployeeId}
              onEmployeeIdChange={onEmployeeIdChange}
              onAddEmployee={onAddEmployee}
              onRemoveEmployee={onRemoveEmployee}
              getEmployeeName={getEmployeeName}
            />
          )}

          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="sm:w-auto w-full"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="sm:w-auto w-full"
            >
              {isLoading ? 
                'Processing...' : 
                (editingPattern ? 'Update Pattern' : 'Create Pattern')
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};