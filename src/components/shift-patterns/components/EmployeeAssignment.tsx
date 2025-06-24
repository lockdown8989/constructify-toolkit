
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, X } from 'lucide-react';

interface EmployeeAssignmentProps {
  employees: any[];
  selectedEmployees: string[];
  selectedEmployeeId: string;
  onEmployeeIdChange: (id: string) => void;
  onAddEmployee: () => void;
  onRemoveEmployee: (employeeId: string) => void;
  getEmployeeName: (employeeId: string) => string;
}

export const EmployeeAssignment = ({
  employees,
  selectedEmployees,
  selectedEmployeeId,
  onEmployeeIdChange,
  onAddEmployee,
  onRemoveEmployee,
  getEmployeeName,
}: EmployeeAssignmentProps) => {
  return (
    <div className="space-y-4 border-t pt-4">
      <h4 className="font-medium flex items-center gap-2 text-base">
        <Users className="h-4 w-4" />
        Assign Employees to Pattern
      </h4>
      
      <div className="flex flex-col sm:flex-row gap-2">
        <Select value={selectedEmployeeId} onValueChange={onEmployeeIdChange}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Choose an employee..." />
          </SelectTrigger>
          <SelectContent>
            {employees
              .filter(emp => !selectedEmployees.includes(emp.id))
              .map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.name} - {employee.job_title}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        <Button 
          type="button"
          onClick={onAddEmployee}
          disabled={!selectedEmployeeId}
          size="sm"
          className="sm:w-auto w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>

      {selectedEmployees.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Selected Employees:</Label>
          <div className="flex flex-wrap gap-2">
            {selectedEmployees.map((employeeId) => (
              <Badge key={employeeId} variant="secondary" className="flex items-center gap-1 text-xs">
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
          <p className="text-xs sm:text-sm text-gray-600">
            This pattern will be applied weekly to the selected employees for the next 12 weeks.
          </p>
        </div>
      )}
    </div>
  );
};
