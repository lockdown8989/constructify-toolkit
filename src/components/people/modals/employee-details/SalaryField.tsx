
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign } from 'lucide-react';
import { Employee } from '@/components/people/types';
import { formatCurrency } from '@/utils/format';

interface SalaryFieldProps {
  employee: Employee;
  isEditing: boolean;
  onInputChange: (field: keyof Employee, value: string | number) => void;
}

const SalaryField: React.FC<SalaryFieldProps> = ({
  employee,
  isEditing,
  onInputChange
}) => {
  // Format salary consistently with British pounds
  const formatSalaryForDisplay = (salary: string | number): string => {
    const salaryString = typeof salary === 'string' ? salary : salary.toString();
    const numericValue = parseFloat(salaryString.replace(/[^0-9.]/g, ''));
    return isNaN(numericValue) ? '£0' : formatCurrency(numericValue, 'GBP');
  };

  const getSalaryInputValue = (salary: string | number): string => {
    if (typeof salary === 'string') {
      return salary.replace(/[£$,\s]/g, '');
    }
    return salary.toString();
  };

  return (
    <div>
      <Label htmlFor="salary">Salary</Label>
      {isEditing ? (
        <Input
          id="salary"
          type="text"
          value={getSalaryInputValue(employee.salary)}
          onChange={(e) => onInputChange('salary', e.target.value)}
          className="mt-1"
          placeholder="45000"
        />
      ) : (
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-gray-500" />
          <span>{formatSalaryForDisplay(employee.salary)}</span>
        </div>
      )}
    </div>
  );
};

export default SalaryField;
