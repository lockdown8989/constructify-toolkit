
import React from 'react';
import EmployeeTableHeader from './EmployeeTableHeader';
import EmployeeTableRow from './EmployeeTableRow';
import { Employee } from '../types';

interface DesktopTableProps {
  employees: Employee[];
  selectedEmployees: string[];
  onSelectEmployee: (id: string) => void;
  onSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEmployeeClick: (employee: Employee) => void;
  onStatusChange?: (id: string, status: string) => void;
}

const DesktopTable: React.FC<DesktopTableProps> = ({
  employees,
  selectedEmployees,
  onSelectEmployee,
  onSelectAll,
  onEmployeeClick,
  onStatusChange,
}) => {
  const handleEmployeeRowClick = (employee: Employee) => {
    console.log("Desktop table - employee row clicked:", employee.id, employee.name);
    onEmployeeClick(employee);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <EmployeeTableHeader 
          selectedCount={selectedEmployees.length}
          totalCount={employees.length}
          onSelectAll={onSelectAll}
        />
        <tbody className="divide-y divide-gray-100">
          {employees.map((employee) => (
            <EmployeeTableRow
              key={employee.id}
              employee={employee}
              isSelected={selectedEmployees.includes(employee.id)}
              onSelect={() => onSelectEmployee(employee.id)}
              onClick={() => handleEmployeeRowClick(employee)}
              onStatusChange={onStatusChange}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DesktopTable;
