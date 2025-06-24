
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEmployees } from '@/hooks/use-employees';
import { useShiftPatterns } from '@/hooks/use-shift-patterns';
import { Users, Plus, X } from 'lucide-react';

interface EmployeeShiftAssignmentProps {
  patternId: string;
  onAssignmentChange?: () => void;
}

const EmployeeShiftAssignment: React.FC<EmployeeShiftAssignmentProps> = ({
  patternId,
  onAssignmentChange
}) => {
  const { data: employees = [] } = useEmployees();
  const { data: shiftPatterns = [] } = useShiftPatterns();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [assignedEmployees, setAssignedEmployees] = useState<string[]>([]);

  const currentPattern = shiftPatterns.find(p => p.id === patternId);
  
  const handleAssignEmployee = () => {
    if (selectedEmployeeId && !assignedEmployees.includes(selectedEmployeeId)) {
      setAssignedEmployees(prev => [...prev, selectedEmployeeId]);
      setSelectedEmployeeId('');
      onAssignmentChange?.();
    }
  };

  const handleRemoveEmployee = (employeeId: string) => {
    setAssignedEmployees(prev => prev.filter(id => id !== employeeId));
    onAssignmentChange?.();
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee?.name || 'Unknown Employee';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Employee Assignment - {currentPattern?.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select an employee..." />
            </SelectTrigger>
            <SelectContent>
              {employees
                .filter(emp => !assignedEmployees.includes(emp.id))
                .map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name} - {employee.job_title}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={handleAssignEmployee}
            disabled={!selectedEmployeeId}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Assign
          </Button>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Assigned Employees:</h4>
          {assignedEmployees.length === 0 ? (
            <p className="text-gray-500 text-sm">No employees assigned to this pattern.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {assignedEmployees.map((employeeId) => (
                <Badge key={employeeId} variant="secondary" className="flex items-center gap-1">
                  {getEmployeeName(employeeId)}
                  <button
                    onClick={() => handleRemoveEmployee(employeeId)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeeShiftAssignment;
