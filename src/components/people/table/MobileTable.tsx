
import React from 'react';
import { cn } from '@/lib/utils';
import EmployeeMobileCard from './EmployeeMobileCard';
import { Employee } from '../types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown } from 'lucide-react';

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
  // Reference to the scroll container
  const scrollRef = React.useRef<HTMLDivElement>(null);
  
  // Function to scroll to the top smoothly
  const scrollToTop = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  // Function to determine if we should show scroll indicator (when there are many employees)
  const shouldShowScrollIndicator = employees.length > 5;

  return (
    <div className="rounded-lg overflow-hidden flex flex-col">
      {employees.length === 0 ? (
        <div className="p-8 text-center text-gray-500 min-h-[200px] flex items-center justify-center">
          <p className="text-sm sm:text-base">No employees found. Try adjusting your filters.</p>
        </div>
      ) : (
        <>
          <ScrollArea 
            className="max-h-[calc(100vh-250px)] overflow-y-auto rounded-lg divide-y divide-gray-100"
            ref={scrollRef}
          >
            <div className="divide-y divide-gray-100">
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
          </ScrollArea>
          
          {shouldShowScrollIndicator && (
            <button 
              onClick={scrollToTop}
              className="mt-2 flex items-center justify-center p-2 text-sm text-gray-500 hover:text-black transition-colors"
              aria-label="Scroll to top"
            >
              <ChevronDown className="h-5 w-5 transform rotate-180 mr-1" />
              <span>Scroll to top</span>
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default MobileTable;
