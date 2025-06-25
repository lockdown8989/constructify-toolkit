
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
import { ShiftPattern } from '@/types/shift-patterns';
import { EmployeeAssignment } from './EmployeeAssignment';

interface FormData {
  name: string;
  start_time: string;
  end_time: string;
  break_duration: number;
  grace_period_minutes: number;
  overtime_threshold_minutes: number;
}

interface ShiftPatternDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingPattern: ShiftPattern | null;
  formData: FormData;
  onFormDataChange: (data: FormData) => void;
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
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="break_duration" className="text-sm font-medium">Break (minutes)</Label>
              <Input
                id="break_duration"
                type="number"
                value={formData.break_duration}
                onChange={(e) => onFormDataChange({...formData, break_duration: parseInt(e.target.value)})}
                min="0"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="grace_period" className="text-sm font-medium">Grace Period (minutes)</Label>
              <Input
                id="grace_period"
                type="number"
                value={formData.grace_period_minutes}
                onChange={(e) => onFormDataChange({...formData, grace_period_minutes: parseInt(e.target.value)})}
                min="0"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="overtime_threshold" className="text-sm font-medium">Overtime Threshold (minutes)</Label>
              <Input
                id="overtime_threshold"
                type="number"
                value={formData.overtime_threshold_minutes}
                onChange={(e) => onFormDataChange({...formData, overtime_threshold_minutes: parseInt(e.target.value)})}
                min="0"
                className="mt-1"
              />
            </div>
          </div>

          {/* Employee Assignment Section - Enhanced with mini menu */}
          <div className="border-t pt-4">
            <Label className="text-sm font-medium mb-3 block">Assign Employees</Label>
            
            {/* Mini Employee Menu */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-medium mb-2">Current Employees</h4>
              <div className="max-h-32 overflow-y-auto space-y-2">
                {employees.length > 0 ? (
                  employees.map((employee) => (
                    <div 
                      key={employee.id}
                      className="flex items-center justify-between p-2 bg-white rounded border hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{employee.name}</span>
                        <span className="text-xs text-gray-500">{employee.job_title || 'No title'}</span>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant={selectedEmployees.includes(employee.id) ? "default" : "outline"}
                        onClick={() => {
                          if (selectedEmployees.includes(employee.id)) {
                            onRemoveEmployee(employee.id);
                          } else {
                            onEmployeeIdChange(employee.id);
                            onAddEmployee();
                          }
                        }}
                        className="text-xs"
                      >
                        {selectedEmployees.includes(employee.id) ? 'Remove' : 'Add'}
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500 text-center py-2">
                    No employees available
                  </div>
                )}
              </div>
            </div>

            {/* Selected Employees Display */}
            {selectedEmployees.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-3">
                <h5 className="text-sm font-medium mb-2 text-blue-900">
                  Selected Employees ({selectedEmployees.length})
                </h5>
                <div className="flex flex-wrap gap-2">
                  {selectedEmployees.map((employeeId) => (
                    <div 
                      key={employeeId}
                      className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs"
                    >
                      <span>{getEmployeeName(employeeId)}</span>
                      <button
                        type="button"
                        onClick={() => onRemoveEmployee(employeeId)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

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
