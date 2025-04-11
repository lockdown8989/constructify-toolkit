
import React, { useRef, useEffect } from 'react';
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

  // Function to determine if we should show scroll indicator (when there are many employees)
  const shouldShowScrollIndicator = employees.length > 5;

  return (
    <div className="rounded-lg overflow-hidden flex flex-col" ref={containerRef}>
      {employees.length === 0 ? (
        <div className="p-8 text-center text-apple-gray-500 min-h-[200px] flex flex-col items-center justify-center">
          <p className="text-base">No employees found</p>
          <p className="text-sm mt-1 text-apple-gray-400">Try adjusting your filters or adding new employees</p>
        </div>
      ) : (
        <>
          <ScrollArea 
            className="max-h-[calc(100vh-250px)] min-h-[300px] overflow-y-auto rounded-lg momentum-scroll"
            ref={scrollAreaRef}
          >
            <div>
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
              className="mt-2 flex items-center justify-center p-2 text-sm text-apple-gray-600 hover:text-apple-blue transition-colors touch-target"
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
