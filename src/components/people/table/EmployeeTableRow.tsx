
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

  const statusColors = {
    green: "bg-apple-green/15 text-apple-green",
    gray: "bg-apple-gray-200 text-apple-gray-700"
  };

  return (
    <tr 
      className={cn(
        "group transition-colors cursor-pointer border-b border-apple-gray-100",
        isSelected ? "bg-apple-blue/5" : "hover:bg-apple-gray-50"
      )}
      onClick={handleRowClick}
    >
      <td className="py-4 px-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-center h-5">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(employee.id)}
            className="rounded border-apple-gray-300 text-apple-blue focus:ring-apple-blue/30"
          />
        </div>
      </td>
      <td className="py-4 px-6">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full overflow-hidden mr-3 border border-apple-gray-200 shadow-sm">
            <img 
              src={employee.avatar} 
              alt={employee.name}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-medium text-apple-gray-900">{employee.name}</span>
        </div>
      </td>
      <td className="py-4 px-6 text-apple-gray-700">{employee.jobTitle}</td>
      <td className="py-4 px-6 text-apple-gray-700">{employee.department}</td>
      <td className="py-4 px-6">
        <div className="flex items-center">
          {employee.siteIcon && (
            <span className="mr-2">{employee.siteIcon}</span>
          )}
          <span className="text-apple-gray-700">{employee.site}</span>
        </div>
      </td>
      <td className="py-4 px-6 font-medium text-apple-gray-900">{employee.salary}</td>
      <td className="py-4 px-6 text-apple-gray-700">{employee.startDate}</td>
      <td className="py-4 px-6 text-apple-gray-700">{employee.lifecycle}</td>
      <td className="py-4 px-6">
        <div className="flex items-center justify-between">
          <span className={cn(
            "inline-block px-3 py-1 rounded-full text-xs font-medium",
            statusColors[employee.statusColor as keyof typeof statusColors]
          )}>
            {employee.status}
          </span>
          
          {onStatusChange && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()} data-dropdown>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-apple-gray-100">
                  <MoreHorizontal className="w-4 h-4 text-apple-gray-600" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl shadow-lg border-apple-gray-200">
                  <DropdownMenuItem onClick={() => handleStatusChange('Active')} className="focus:bg-apple-gray-50">
                    <CheckCircle className="mr-2 h-4 w-4 text-apple-green" />
                    <span>Set as Active</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange('Inactive')} className="focus:bg-apple-gray-50">
                    <XCircle className="mr-2 h-4 w-4 text-apple-gray-600" />
                    <span>Set as Inactive</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange('Invited')} className="focus:bg-apple-gray-50">
                    <Mail className="mr-2 h-4 w-4 text-apple-blue" />
                    <span>Set as Invited</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange('Absent')} className="focus:bg-apple-gray-50">
                    <Users className="mr-2 h-4 w-4 text-apple-orange" />
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
