
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Clock } from 'lucide-react';
import { ShiftPattern } from '@/types/shift-patterns';

interface Employee {
  id: string;
  name: string;
}

interface RotaPatternDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingPattern: ShiftPattern | null;
  formData: Omit<ShiftPattern, 'id' | 'created_at' | 'updated_at'>;
  onFormDataChange: (data: Omit<ShiftPattern, 'id' | 'created_at' | 'updated_at'>) => void;
  employees: Employee[];
  selectedEmployees: string[];
  selectedEmployeeId: string;
  onEmployeeIdChange: (value: string) => void;
  onAddEmployee: () => void;
  onRemoveEmployee: (employeeId: string) => void;
  getEmployeeName: (employeeId: string) => string;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export const RotaPatternDialog: React.FC<RotaPatternDialogProps> = ({
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
  isLoading
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {editingPattern ? 'Edit Rota Pattern' : 'Create New Rota Pattern'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="name">Rota Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
                placeholder="e.g., Morning Shift, Evening Shift"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_time">Start Time *</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => onFormDataChange({ ...formData, start_time: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="end_time">End Time *</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => onFormDataChange({ ...formData, end_time: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="break_duration">Break Duration (minutes)</Label>
                <Input
                  id="break_duration"
                  type="number"
                  value={formData.break_duration}
                  onChange={(e) => onFormDataChange({ ...formData, break_duration: parseInt(e.target.value) || 30 })}
                  min="0"
                  max="180"
                />
              </div>
              <div>
                <Label htmlFor="grace_period">Grace Period (minutes)</Label>
                <Input
                  id="grace_period"
                  type="number"
                  value={formData.grace_period_minutes}
                  onChange={(e) => onFormDataChange({ ...formData, grace_period_minutes: parseInt(e.target.value) || 15 })}
                  min="0"
                  max="60"
                />
              </div>
              <div>
                <Label htmlFor="overtime_threshold">Overtime Threshold (minutes)</Label>
                <Input
                  id="overtime_threshold"
                  type="number"
                  value={formData.overtime_threshold_minutes}
                  onChange={(e) => onFormDataChange({ ...formData, overtime_threshold_minutes: parseInt(e.target.value) || 15 })}
                  min="0"
                  max="120"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Label>Assign Employees to Rota</Label>
            <div className="flex gap-2">
              <Select value={selectedEmployeeId} onValueChange={onEmployeeIdChange}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select an employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees
                    .filter(emp => !selectedEmployees.includes(emp.id))
                    .map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                onClick={onAddEmployee}
                disabled={!selectedEmployeeId || selectedEmployees.includes(selectedEmployeeId)}
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {selectedEmployees.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Assigned Employees ({selectedEmployees.length})</p>
                <div className="flex flex-wrap gap-2">
                  {selectedEmployees.map((employeeId) => (
                    <Badge key={employeeId} variant="secondary" className="flex items-center gap-1">
                      {getEmployeeName(employeeId)}
                      <button
                        type="button"
                        onClick={() => onRemoveEmployee(employeeId)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : editingPattern ? 'Update Rota' : 'Create Rota'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
