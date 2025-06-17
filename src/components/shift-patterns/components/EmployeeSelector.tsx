
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Employee } from '@/types/employee';

interface EmployeeSelectorProps {
  employees: Employee[];
  selectedEmployee: string;
  onEmployeeSelect: (employeeId: string) => void;
}

const EmployeeSelector = ({ employees, selectedEmployee, onEmployeeSelect }: EmployeeSelectorProps) => {
  return (
    <div>
      <Label htmlFor="employee-select">Select Employee</Label>
      <Select onValueChange={onEmployeeSelect} value={selectedEmployee}>
        <SelectTrigger>
          <SelectValue placeholder="Choose an employee..." />
        </SelectTrigger>
        <SelectContent>
          {employees.map((employee) => {
            // Add validation to prevent invalid data from causing crashes
            if (!employee || !employee.id || !employee.name) {
              console.warn('Invalid employee data:', employee);
              return null;
            }
            
            return (
              <SelectItem key={employee.id} value={employee.id}>
                {employee.name} - {employee.job_title || 'No Title'}
              </SelectItem>
            );
          }).filter(Boolean)}
        </SelectContent>
      </Select>
    </div>
  );
};

export default EmployeeSelector;
