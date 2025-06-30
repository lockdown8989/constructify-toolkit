import React from 'react';
import { cn } from '@/lib/utils';
import { MoreVertical, ChevronRight, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Employee } from '../types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatCurrency } from '@/utils/format';

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
    // Don't trigger row click when clicking the checkbox, actions, or dropdown
    if ((e.target as HTMLElement).tagName === 'INPUT' ||
        (e.target as HTMLElement).closest('input[type="checkbox"]') ||
        (e.target as HTMLElement).closest('[data-dropdown]')) {
      return;
    }
    
    if (onRowClick) {
      onRowClick(employee);
    }
  };
  
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const statusColors = {
    Active: "bg-green-100 text-green-700 border border-green-200",
    Inactive: "bg-gray-100 text-gray-700 border border-gray-200",
    Invited: "bg-blue-100 text-blue-700 border border-blue-200",
    Absent: "bg-amber-100 text-amber-700 border border-amber-200"
  };

  // Extract numeric value from salary string and format with British pounds
  const formatSalaryDisplay = (salaryString: string): string => {
    const numericValue = parseInt(salaryString.replace(/[^0-9]/g, ''));
    return formatCurrency(numericValue, true, 'GBP');
  };

  return (
    <tr
      className={cn(
        "transition-colors group hover:bg-gray-50 cursor-pointer",
        isSelected && "bg-blue-50 hover:bg-blue-50"
      )}
      onClick={handleRowClick}
      style={{ lineHeight: "1.4", minHeight: 64 }}
    >
      <td className="py-3 px-4 whitespace-nowrap">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(employee.id)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-5 h-5"
          onClick={e => e.stopPropagation()}
        />
      </td>
      <td className="py-3 px-4 whitespace-nowrap min-w-[200px]">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 rounded-full border border-gray-200 flex-shrink-0">
            <AvatarImage
              src={employee.avatar}
              alt={employee.name}
              className="object-cover"
            />
            <AvatarFallback className="bg-blue-100 text-blue-700 font-medium">
              {getInitials(employee.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold text-gray-900 text-base">{employee.name}</div>
            <div className="text-sm text-gray-500">{employee.jobTitle}</div>
          </div>
        </div>
      </td>
      <td className="py-3 px-4 whitespace-nowrap">
        <span className="text-gray-700 font-medium">{employee.department}</span>
      </td>
      <td className="py-3 px-4 whitespace-nowrap">
        <div className="flex items-center">
          <span className="mr-1">{employee.siteIcon}</span>
          <span className="text-gray-700">{employee.site}</span>
        </div>
      </td>
      <td className="py-3 px-4 whitespace-nowrap">
        <span className="font-medium text-gray-900">{formatSalaryDisplay(employee.salary)}</span>
      </td>
      <td className="py-3 px-4 whitespace-nowrap">
        <span className="text-gray-700">{employee.startDate}</span>
      </td>
      <td className="py-3 px-4 whitespace-nowrap">
        <span className="text-gray-700">{employee.lifecycle}</span>
      </td>
      <td className="py-3 px-4 whitespace-nowrap">
        <span className={cn(
          "inline-block px-2 py-1 rounded-full text-xs font-medium",
          statusColors[employee.status as keyof typeof statusColors]
        )}>
          {employee.status}
        </span>
      </td>
      <td className="py-3 px-4 whitespace-nowrap text-right">
        <div className="flex items-center justify-end space-x-2" onClick={e => e.stopPropagation()}>
          {onStatusChange && (
            <div data-dropdown>
              <DropdownMenu>
                <DropdownMenuTrigger className="p-1.5 rounded-full hover:bg-gray-200">
                  <MoreVertical className="h-5 w-5 text-gray-500" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => onStatusChange(employee.id, 'Active')}>
                    Set as Active
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange(employee.id, 'Inactive')}>
                    Set as Inactive
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange(employee.id, 'Invited')}>
                    Set as Invited
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange(employee.id, 'Absent')}>
                    Set as Absent
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
          <button className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default EmployeeTableRow;
