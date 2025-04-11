
import React from 'react';
import { Employee } from '@/types/restaurant-schedule';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users } from 'lucide-react';

interface EmployeeListProps {
  employees: Employee[];
}

const EmployeeList = ({ employees }: EmployeeListProps) => {
  const handleDragStart = (e: React.DragEvent, employeeId: string) => {
    e.dataTransfer.setData('employeeId', employeeId);
    e.dataTransfer.effectAllowed = 'move';
    
    // Add ghost image styling
    const dragImage = document.createElement('div');
    dragImage.className = 'bg-white p-2 rounded shadow-lg border border-gray-200';
    dragImage.textContent = 'Assigning employee';
    document.body.appendChild(dragImage);
    
    // Position it off-screen
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    
    // Set custom drag image if supported
    if (e.dataTransfer.setDragImage) {
      e.dataTransfer.setDragImage(dragImage, 0, 0);
    }
    
    // Clean up after drag starts
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
  };
  
  return (
    <div className="col-span-1 border-r border-gray-200 bg-gray-50/50">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-100/80">
        <div className="flex items-center">
          <Users className="h-5 w-5 mr-2 text-gray-700" />
          <span className="font-medium text-gray-800">Staff</span>
        </div>
      </div>
      
      <div className="p-2 space-y-1.5">
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
                className="flex items-center p-2.5 rounded-lg hover:bg-white hover:shadow-sm cursor-move transition-all active:bg-gray-100"
              >
                <Avatar className="h-8 w-8 mr-2.5 border border-gray-200">
                  <AvatarImage src={employee.avatarUrl || '/placeholder.svg'} alt={employee.name} />
                  <AvatarFallback className="bg-blue-50 text-blue-700 text-xs">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium text-sm text-gray-900">{employee.name}</span>
                  <span className="text-xs text-gray-500">{employee.role}</span>
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
