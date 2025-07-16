
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Employee } from '@/types/employee';
import EmployeeStatusDropdown from '../modals/employee-details/EmployeeStatusDropdown';

interface EmployeeTableRowProps {
  employee: Employee;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onEmployeeClick: (employee: Employee) => void;
  onStatusChange: (employee: Employee, newStatus: string) => void;
  isUpdating: boolean;
}

export const EmployeeTableRow: React.FC<EmployeeTableRowProps> = ({
  employee,
  isSelected,
  onSelect,
  onEmployeeClick,
  onStatusChange,
  isUpdating
}) => {
  const handleRowClick = (e: React.MouseEvent) => {
    // Don't trigger row click if clicking on the status dropdown or checkbox
    if ((e.target as HTMLElement).closest('.status-dropdown') || 
        (e.target as HTMLElement).closest('[data-checkbox]')) {
      return;
    }
    onEmployeeClick(employee);
  };

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      case 'invited':
        return 'outline';
      case 'absent':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <TableRow 
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={handleRowClick}
    >
      <TableCell className="w-12">
        <div data-checkbox onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelect(employee.id)}
          />
        </div>
      </TableCell>
      <TableCell className="font-medium">{employee.name}</TableCell>
      <TableCell>{employee.job_title}</TableCell>
      <TableCell>{employee.department}</TableCell>
      <TableCell>{employee.site}</TableCell>
      <TableCell>
        <div className="status-dropdown" onClick={(e) => e.stopPropagation()}>
          <EmployeeStatusDropdown
            currentStatus={employee.status}
            onStatusChange={(newStatus) => onStatusChange(employee, newStatus)}
            disabled={isUpdating}
          />
        </div>
      </TableCell>
      <TableCell>{employee.employment_type}</TableCell>
      <TableCell>£{employee.salary?.toLocaleString() || '0'}</TableCell>
    </TableRow>
  );
};
