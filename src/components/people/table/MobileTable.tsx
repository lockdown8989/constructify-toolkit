
import React from 'react';
import EmployeeMobileCard from './EmployeeMobileCard';
import { Employee } from '../types';

interface MobileTableProps {
  employees: Employee[];
  selectedEmployees: string[];
  expandedEmployee: string | null;
  onSelectEmployee: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onEmployeeClick?: (employee: Employee) => void;
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
  return (
    <div className="w-full h-full">
      {employees.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">👥</span>
          </div>
          <p className="text-lg font-medium text-gray-900 mb-2">No team members found</p>
          <p className="text-sm text-gray-500 max-w-sm">
            Try adjusting your search criteria or add new team members to get started
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 p-2 sm:p-4">
          {employees.map((employee) => (
            <EmployeeMobileCard
              key={employee.id}
              employee={employee}
              isSelected={selectedEmployees.includes(employee.id)}
              isExpanded={expandedEmployee === employee.id}
              onSelect={onSelectEmployee}
              onToggleExpand={onToggleExpand}
              onCardClick={onEmployeeClick}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MobileTable;
