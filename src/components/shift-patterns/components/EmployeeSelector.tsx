
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
  // Filter and validate employees
  const validEmployees = employees.filter(employee => {
    // Ensure employee has required fields
    return employee && 
           employee.id && 
           typeof employee.id === 'string' &&
           employee.name && 
           typeof employee.name === 'string' &&
           employee.id !== 'undefined' &&
           employee.id !== 'null' &&
           employee.name.trim() !== '';
  });

  const handleEmployeeChange = (value: string) => {
    console.log('Employee selection changed:', value);
    
    // Validate the selected value
    if (!value || value === 'undefined' || value === 'null' || value === '') {
      console.warn('Invalid employee selection, clearing selection');
      onEmployeeSelect('');
      return;
    }

    // Check if the selected employee exists in our list
    const selectedEmployeeExists = validEmployees.some(emp => emp.id === value);
    if (!selectedEmployeeExists) {
      console.warn('Selected employee not found in list:', value);
      onEmployeeSelect('');
      return;
    }

    onEmployeeSelect(value);
  };

  return (
    <div>
      <Label htmlFor="employee-select">Select Employee</Label>
      <Select onValueChange={handleEmployeeChange} value={selectedEmployee || ''}>
        <SelectTrigger>
          <SelectValue placeholder="Choose an employee..." />
        </SelectTrigger>
        <SelectContent>
          {validEmployees.length === 0 ? (
            <SelectItem value="no-employees" disabled>
              No employees available
            </SelectItem>
          ) : (
            validEmployees.map((employee) => (
              <SelectItem key={employee.id} value={employee.id}>
                {employee.name} - {employee.job_title || 'No Title'}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      {validEmployees.length === 0 && employees.length > 0 && (
        <p className="text-sm text-red-500 mt-1">
          Some employee data is invalid. Please check employee records.
        </p>
      )}
    </div>
  );
};

export default EmployeeSelector;
