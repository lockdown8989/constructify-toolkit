
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
  };

  return (
    <div className="col-span-1 border-r border-gray-200 bg-gray-50">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-100">
        <div className="flex items-center">
          <Users className="h-5 w-5 mr-2 text-gray-700" />
          <span className="font-medium text-gray-800">Staff</span>
        </div>
      </div>
      
      <div className="p-2 space-y-2">
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
                className="flex items-center p-2 rounded-lg hover:bg-gray-100 cursor-move transition-colors"
              >
                <Avatar className="h-9 w-9 mr-2 border border-gray-200">
                  <AvatarImage src={employee.avatarUrl || '/placeholder.svg'} alt={employee.name} />
                  <AvatarFallback className="bg-blue-100 text-blue-800">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium text-sm text-gray-900">{employee.name}</span>
                  <span className="text-xs text-gray-500">{employee.role || employee.job_title}</span>
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
