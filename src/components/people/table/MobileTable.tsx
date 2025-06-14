
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
  // Reference to the scroll container
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Function to scroll to the top smoothly
  const scrollToTop = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  // Add touch feedback for better mobile experience
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      const card = target.closest('.employee-card');
      if (card) {
        card.classList.add('touch-active');
      }
    };
    
    const handleTouchEnd = () => {
      const activeCards = container.querySelectorAll('.touch-active');
      activeCards.forEach(card => card.classList.remove('touch-active'));
    };
    
    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('touchcancel', handleTouchEnd);
    
    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, []);

  return (
    <div className="flex flex-col" ref={containerRef}>
      {employees.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No team members found</h3>
          <p className="text-sm text-gray-500 max-w-sm">
            Try adjusting your filters or adding new team members to get started
          </p>
        </div>
      ) : (
        <ScrollArea 
          className="max-h-[calc(100vh-300px)] min-h-[400px] overflow-y-auto momentum-scroll"
          ref={scrollAreaRef}
        >
          <div className="px-1">
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
      )}
    </div>
  );
};

export default MobileTable;
