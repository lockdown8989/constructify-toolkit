
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
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
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
    
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    container.addEventListener('touchcancel', handleTouchEnd, { passive: true });
    
    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, []);

  // Function to determine if we should show scroll indicator (when there are many employees)
  const shouldShowScrollIndicator = employees.length > 5;

  return (
    <div className="flex flex-col h-full" ref={containerRef}>
      {employees.length === 0 ? (
        <div className="p-8 text-center text-gray-500 min-h-[200px] flex flex-col items-center justify-center">
          <p className="text-base">No team members found</p>
          <p className="text-sm mt-1 text-gray-400">Try adjusting your filters or adding new team members</p>
        </div>
      ) : (
        <>
          <ScrollArea 
            className="flex-1 h-[calc(100vh-280px)] min-h-[400px] px-1"
            ref={scrollAreaRef}
          >
            <div className="space-y-2 pb-4">
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
            <div className="flex justify-center py-2 border-t border-gray-100">
              <button 
                onClick={scrollToTop}
                className="flex items-center justify-center px-4 py-2 text-sm text-gray-600 hover:text-blue-600 transition-colors touch-target rounded-lg hover:bg-gray-50"
                aria-label="Scroll to top"
              >
                <ChevronDown className="h-4 w-4 transform rotate-180 mr-1" />
                <span>Back to top</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MobileTable;
