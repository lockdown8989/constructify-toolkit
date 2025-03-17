
import React from 'react';
import { cn } from '@/lib/utils';
import { Employee } from '../types';

interface EmployeeTableRowProps {
  employee: Employee;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const EmployeeTableRow: React.FC<EmployeeTableRowProps> = ({
  employee,
  isSelected,
  onSelect,
}) => {
  return (
    <tr 
      className={cn(
        "group transition-colors",
        isSelected ? "bg-crextio-accent/10" : "hover:bg-gray-50"
      )}
    >
      <td className="py-4 px-6">
        <div className="flex items-center justify-center h-5">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(employee.id)}
            className="rounded border-gray-300 text-black focus:ring-black"
          />
        </div>
      </td>
      <td className="py-4 px-6">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
            <img 
              src={employee.avatar} 
              alt={employee.name}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-medium">{employee.name}</span>
        </div>
      </td>
      <td className="py-4 px-6 text-gray-600">{employee.jobTitle}</td>
      <td className="py-4 px-6 text-gray-600">{employee.department}</td>
      <td className="py-4 px-6">
        <div className="flex items-center">
          {employee.siteIcon && (
            <span className="mr-2">{employee.siteIcon}</span>
          )}
          <span className="text-gray-600">{employee.site}</span>
        </div>
      </td>
      <td className="py-4 px-6 font-medium">{employee.salary}</td>
      <td className="py-4 px-6 text-gray-600">{employee.startDate}</td>
      <td className="py-4 px-6 text-gray-600">{employee.lifecycle}</td>
      <td className="py-4 px-6">
        <span className={cn(
          "inline-block px-3 py-1 rounded-full text-xs font-medium",
          employee.statusColor === 'green' && "bg-crextio-success/20 text-green-700",
          employee.statusColor === 'gray' && "bg-gray-200 text-gray-700"
        )}>
          {employee.status}
        </span>
      </td>
    </tr>
  );
};

export default EmployeeTableRow;
