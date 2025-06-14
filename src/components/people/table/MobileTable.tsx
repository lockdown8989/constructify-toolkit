
import React from 'react';
import EmployeeMobileCard from './EmployeeMobileCard';
import { Employee } from '../types';

interface MobileTableProps {
  employees: Employee[];
  selectedEmployees: string[];
  expandedEmployee: string | null;
  onSelectEmployee: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onEmployeeClick: (employee: Employee) => void;
  onStatusChange?: (id: string, status: string) => void;
}

const MobileTable: React.FC<MobileTableProps> = ({
  employees,
  selectedEmployees,
  expandedEmployee,
  onSelectEmployee,
  onToggleExpand,
  onEmployeeClick,
  onStatusChange,
}) => {
  const handleEmployeeCardClick = (employee: Employee) => {
    console.log("Mobile table - employee card clicked:", employee.id, employee.name);
    onEmployeeClick(employee);
  };

  return (
    <div className="divide-y divide-gray-200">
      {employees.map((employee) => (
        <EmployeeMobileCard
          key={employee.id}
          employee={employee}
          isSelected={selectedEmployees.includes(employee.id)}
          isExpanded={expandedEmployee === employee.id}
          onSelect={onSelectEmployee}
          onToggleExpand={onToggleExpand}
          onCardClick={() => handleEmployeeCardClick(employee)}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
};

export default MobileTable;
