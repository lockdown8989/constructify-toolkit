
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Clock, AlertCircle } from 'lucide-react';
import { ShiftTemplate } from '@/types/schedule';

interface Employee {
  id: string;
  name: string;
  job_title?: string;
}

interface RotaPatternDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingPattern: ShiftTemplate | null;
  formData: Omit<ShiftTemplate, 'id' | 'created_at' | 'updated_at'>;
  onFormDataChange: (data: Omit<ShiftTemplate, 'id' | 'created_at' | 'updated_at'>) => void;
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
  // Filter out employees that are already selected
  const availableEmployees = employees.filter(emp => 
    emp && 
    emp.id && 
    typeof emp.id === 'string' && 
    emp.id.trim() !== '' &&
    emp.name && 
    typeof emp.name === 'string' &&
    emp.name.trim() !== '' &&
    !selectedEmployees.includes(emp.id)
  );

  console.log('RotaPatternDialog render:', {
    employees: employees?.length || 0,
    selectedEmployees,
    selectedEmployeeId,
    availableEmployees: availableEmployees?.length || 0
  });

  const handleAddEmployee = () => {
    console.log('RotaPatternDialog handleAddEmployee called:', {
      selectedEmployeeId,
      canAdd: selectedEmployeeId && selectedEmployeeId.trim() !== '' && selectedEmployeeId !== 'no-employees'
    });
    
    if (selectedEmployeeId && selectedEmployeeId.trim() !== '' && selectedEmployeeId !== 'no-employees') {
      // Validate that the selected employee exists in available employees
      const employeeExists = availableEmployees.some(emp => emp.id === selectedEmployeeId);
      if (!employeeExists) {
        console.error('Selected employee not found in available employees');
        return;
      }
      
      console.log('Calling onAddEmployee');
      onAddEmployee();
    }
  };

  const handleEmployeeChange = (value: string) => {
    console.log('Employee selection changed:', { value, isValidSelection: value !== 'no-employees' });
    if (value !== 'no-employees') {
      onEmployeeIdChange(value);
    }
  };

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
                <Label htmlFor="role">Role (optional)</Label>
                <Input
                  id="role"
                  type="text"
                  value={formData.role || ''}
                  onChange={(e) => onFormDataChange({ ...formData, role: e.target.value })}
                  placeholder="e.g. Nurse, Cashier, Manager"
                />
              </div>
              <div>
                <Label htmlFor="location">Location (optional)</Label>
                <Input
                  id="location"
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => onFormDataChange({ ...formData, location: e.target.value })}
                  placeholder="e.g. Store 1, Building A"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <Label className="text-base font-medium">Assign Employees to Rota</Label>
            
            {employees.length === 0 && (
              <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-md">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <p className="text-sm text-orange-700">
                  No employees found. Please ensure employees are properly configured.
                </p>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <Select value={selectedEmployeeId || ''} onValueChange={handleEmployeeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an employee..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    {availableEmployees.length === 0 ? (
                      <SelectItem value="no-employees" disabled>
                        {employees.length === 0 ? 'No employees available' : 'All employees already assigned'}
                      </SelectItem>
                    ) : (
                      availableEmployees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name} - {employee.job_title || 'No Title'}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="button"
                onClick={handleAddEmployee}
                disabled={!selectedEmployeeId || selectedEmployeeId.trim() === '' || selectedEmployeeId === 'no-employees' || availableEmployees.length === 0}
                size="sm"
                className="sm:w-auto w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>

            {selectedEmployees.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Assigned Employees ({selectedEmployees.length})</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedEmployees.map((employeeId) => (
                    <Badge key={employeeId} variant="secondary" className="flex items-center gap-1">
                      {getEmployeeName(employeeId)}
                      <button
                        type="button"
                        onClick={() => onRemoveEmployee(employeeId)}
                        className="ml-1 hover:text-red-600"
                        aria-label={`Remove ${getEmployeeName(employeeId)}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-gray-600">
                  This pattern will be applied weekly to the selected employees for the next 12 weeks.
                </p>
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
