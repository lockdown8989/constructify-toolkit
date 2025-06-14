
import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import EmployeeMobileCard from './EmployeeMobileCard';
import { Employee } from '../types';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Add momentum scrolling for iOS using CSS class instead
  useEffect(() => {
    const scrollElement = scrollAreaRef.current;
    if (scrollElement) {
      scrollElement.style.overflowScrolling = 'touch';
    }
  }, []);

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
        <div className="space-y-0 divide-y divide-gray-100">
          {employees.map((employee, index) => (
            <div
              key={employee.id}
              className={cn(
                "transition-all duration-200",
                index === 0 && "rounded-t-2xl",
                index === employees.length - 1 && "rounded-b-2xl"
              )}
            >
              <EmployeeMobileCard
                employee={employee}
                isSelected={selectedEmployees.includes(employee.id)}
                isExpanded={expandedEmployee === employee.id}
                onSelect={onSelectEmployee}
                onToggleExpand={onToggleExpand}
                onCardClick={onEmployeeClick}
                onStatusChange={onStatusChange}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MobileTable;
