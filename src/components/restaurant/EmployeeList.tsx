
import React from 'react';
import { Employee } from '@/types/restaurant-schedule';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmployeeListProps {
  employees: Employee[];
}

const EmployeeList = ({ employees }: EmployeeListProps) => {
  const handleDragStart = (e: React.DragEvent, employeeId: string) => {
    e.dataTransfer.setData('employeeId', employeeId);
    e.dataTransfer.effectAllowed = 'move';
    
    // Create and append ghost image element
    const ghostEl = document.createElement('div');
    ghostEl.className = 'fixed top-0 left-0 -translate-x-full bg-white rounded-lg shadow-lg p-3 pointer-events-none';
    ghostEl.innerHTML = `
      <div class="flex items-center">
        <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <div>Assigning...</div>
      </div>
    `;
    document.body.appendChild(ghostEl);
    
    if (e.dataTransfer.setDragImage) {
      e.dataTransfer.setDragImage(ghostEl, 10, 10);
    }
    
    // Clean up after drag starts
    setTimeout(() => {
      document.body.removeChild(ghostEl);
    }, 0);
  };
  
  return (
    <div className="col-span-1 border-r border-gray-200 bg-gray-50/50">
      <div className="p-3 sm:p-4 border-b border-gray-200 flex items-center justify-between bg-gray-100/80">
        <div className="flex items-center">
          <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-gray-700" />
          <span className="font-medium text-gray-800 text-sm sm:text-base">Staff</span>
        </div>
      </div>
      
      <div className="p-2 space-y-1">
        {employees.length === 0 ? (
          <div className="text-center py-4 text-gray-500 text-sm">
            No employees found
          </div>
        ) : (
          employees.map(employee => {
            const initials = employee.name.split(' ').map(n => n[0]).join('');
            
            return (
              <div 
                key={employee.id}
                draggable
                onDragStart={(e) => handleDragStart(e, employee.id)}
                className={cn(
                  "flex items-center p-2 sm:p-2.5 rounded-lg hover:bg-white hover:shadow-sm cursor-move transition-all active:bg-gray-100",
                  "active-touch-state" // For mobile touch feedback
                )}
              >
                <Avatar className="h-7 w-7 sm:h-8 sm:w-8 mr-2.5 border border-gray-200">
                  <AvatarImage src={employee.avatarUrl || '/placeholder.svg'} alt={employee.name} />
                  <AvatarFallback className="bg-blue-50 text-blue-700 text-xs">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col overflow-hidden">
                  <span className="font-medium text-xs sm:text-sm text-gray-900 truncate">{employee.name}</span>
                  <span className="text-xs text-gray-500 truncate">{employee.role}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default EmployeeList;
