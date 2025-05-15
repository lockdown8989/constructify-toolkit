
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Employee } from '@/types/employee';
import { ScrollArea } from "@/components/ui/scroll-area";

interface EmployeeListProps {
  employees: Employee[];
  selectedEmployee: string | null;
  isLoading: boolean;
  onSelectEmployee: (employeeId: string, employeeName: string) => void;
}

const EmployeeList: React.FC<EmployeeListProps> = ({ 
  employees, 
  selectedEmployee, 
  isLoading, 
  onSelectEmployee 
}) => {
  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col space-y-2">
        {Array(5).fill(0).map((_, i) => (
          <div key={i} className="h-16 bg-gray-800 animate-pulse rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-220px)]">
      <div className="space-y-2">
        {employees.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            No employees found
          </div>
        ) : (
          employees.map(employee => (
            <div
              key={employee.id}
              onClick={() => onSelectEmployee(employee.id, employee.name)}
              className={`employee-list-item flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all ${
                selectedEmployee === employee.id 
                  ? "selected bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-600/30" 
                  : "hover:bg-gray-800/60"
              }`}
            >
              <Avatar className="h-10 w-10">
                {employee.avatar ? (
                  <AvatarImage src={employee.avatar} alt={employee.name} />
                ) : null}
                <AvatarFallback className="bg-gray-700">
                  {getInitials(employee.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-medium text-sm">{employee.name}</div>
                <div className="text-xs text-gray-400">{employee.job_title}</div>
              </div>
              <div className={`w-2 h-2 rounded-full ${
                employee.status === 'Active' ? 'bg-green-500' : 'bg-gray-500'
              }`}></div>
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  );
};

export default EmployeeList;
