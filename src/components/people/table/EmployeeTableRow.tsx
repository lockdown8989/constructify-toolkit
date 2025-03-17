
import React from 'react';
import { cn } from '@/lib/utils';
import { Employee } from '../types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, CheckCircle, XCircle, Mail, Users } from 'lucide-react';

interface EmployeeTableRowProps {
  employee: Employee;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onRowClick?: (employee: Employee) => void;
  onStatusChange?: (id: string, status: string) => void;
}

const EmployeeTableRow: React.FC<EmployeeTableRowProps> = ({
  employee,
  isSelected,
  onSelect,
  onRowClick,
  onStatusChange,
}) => {
  const handleRowClick = (e: React.MouseEvent) => {
    // Don't trigger row click when clicking the checkbox or dropdown
    if ((e.target as HTMLElement).tagName === 'INPUT' || 
        (e.target as HTMLElement).closest('input[type="checkbox"]') ||
        (e.target as HTMLElement).closest('[data-dropdown]')) {
      return;
    }
    
    if (onRowClick) {
      onRowClick(employee);
    }
  };

  const handleStatusChange = (status: string) => {
    if (onStatusChange) {
      onStatusChange(employee.id, status);
    }
  };

  return (
    <tr 
      className={cn(
        "group transition-colors cursor-pointer",
        isSelected ? "bg-crextio-accent/10" : "hover:bg-gray-50"
      )}
      onClick={handleRowClick}
    >
      <td className="py-4 px-6" onClick={e => e.stopPropagation()}>
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
        <div className="flex items-center justify-between">
          <span className={cn(
            "inline-block px-3 py-1 rounded-full text-xs font-medium",
            employee.statusColor === 'green' && "bg-crextio-success/20 text-green-700",
            employee.statusColor === 'gray' && "bg-gray-200 text-gray-700"
          )}>
            {employee.status}
          </span>
          
          {onStatusChange && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()} data-dropdown>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100">
                  <MoreHorizontal className="w-4 h-4 text-gray-500" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleStatusChange('Active')}>
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    <span>Set as Active</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange('Inactive')}>
                    <XCircle className="mr-2 h-4 w-4 text-gray-500" />
                    <span>Set as Inactive</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange('Invited')}>
                    <Mail className="mr-2 h-4 w-4 text-blue-500" />
                    <span>Set as Invited</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange('Absent')}>
                    <Users className="mr-2 h-4 w-4 text-orange-500" />
                    <span>Set as Absent</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

export default EmployeeTableRow;
