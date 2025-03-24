
import React from 'react';
import { cn } from '@/lib/utils';
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
    <div className="divide-y divide-gray-100 rounded-lg overflow-hidden">
      {employees.length === 0 ? (
        <div className="p-8 text-center text-gray-500 min-h-[200px] flex items-center justify-center">
          <p className="text-sm sm:text-base">No employees found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
          {employees.map(employee => (
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
