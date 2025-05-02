
import React from 'react';
import { Employee } from '@/components/dashboard/salary-table/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';

interface EmployeeSelectorProps {
  employees: Employee[];
  selectedEmployees: Set<string>;
  onSelectEmployee: (id: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}

export const EmployeeSelector: React.FC<EmployeeSelectorProps> = ({
  employees,
  selectedEmployees,
  onSelectEmployee,
  onSelectAll,
  onClearAll,
}) => {
  const allSelected = employees.length > 0 && selectedEmployees.size === employees.length;
  
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Employees</span>
        <div className="flex items-center gap-2">
          <button 
            onClick={onSelectAll}
            className="text-xs underline text-gray-600 hover:text-black"
          >
            Select All
          </button>
          <button 
            onClick={onClearAll}
            className="text-xs underline text-gray-600 hover:text-black"
          >
            Clear
          </button>
        </div>
      </div>
      
      {employees.length > 0 ? (
        <ScrollArea className="h-[150px] border rounded-md p-2">
          <div className="space-y-2">
            {employees.map(employee => (
              <div key={employee.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`employee-${employee.id}`}
                  checked={selectedEmployees.has(employee.id)}
                  onCheckedChange={() => onSelectEmployee(employee.id)}
                />
                <label 
                  htmlFor={`employee-${employee.id}`}
                  className="text-sm flex items-center cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full overflow-hidden mr-2">
                    {employee.avatar ? (
                      <img 
                        src={employee.avatar} 
                        alt={employee.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs">
                        {employee.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span>{employee.name}</span>
                </label>
              </div>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="flex items-center justify-center h-[150px] border rounded-md p-2 text-gray-500">
          No employees found
        </div>
      )}
    </div>
  );
};
