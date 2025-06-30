
import React from 'react';
import { cn } from '@/lib/utils';
import { MoreVertical, ChevronRight } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Employee } from '../types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatCurrency } from '@/utils/format';

interface EmployeeMobileCardProps {
  employee: Employee;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onRowClick?: (employee: Employee) => void;
  onStatusChange?: (id: string, status: string) => void;
}

const EmployeeMobileCard: React.FC<EmployeeMobileCardProps> = ({
  employee,
  isSelected,
  onSelect,
  onRowClick,
  onStatusChange,
}) => {
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click when clicking the checkbox, actions, or dropdown
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
    return formatCurrency(numericValue, 'GBP');
  };

  return (
    <div
      className={cn(
        "bg-white border border-gray-200 rounded-lg p-4 mb-3 transition-colors cursor-pointer hover:bg-gray-50",
        isSelected && "border-blue-500 bg-blue-50"
      )}
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(employee.id)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-5 h-5 mt-1"
            onClick={e => e.stopPropagation()}
          />
          
          <Avatar className="h-10 w-10 rounded-full border border-gray-200 flex-shrink-0">
            <AvatarImage
              src={employee.avatar}
              alt={employee.name}
              className="object-cover"
            />
            <AvatarFallback className="bg-blue-100 text-blue-700 font-medium text-sm">
              {getInitials(employee.name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 text-sm">{employee.name}</div>
            <div className="text-xs text-gray-500 mt-1">{employee.jobTitle}</div>
            <div className="text-xs text-gray-500">{employee.department}</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2" onClick={e => e.stopPropagation()}>
          <span className={cn(
            "inline-block px-2 py-1 rounded-full text-xs font-medium",
            statusColors[employee.status as keyof typeof statusColors]
          )}>
            {employee.status}
          </span>
          
          {onStatusChange && (
            <div data-dropdown>
              <DropdownMenu>
                <DropdownMenuTrigger className="p-1.5 rounded-full hover:bg-gray-200">
                  <MoreVertical className="h-4 w-4 text-gray-500" />
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
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-gray-500">Site:</span>
            <div className="flex items-center mt-1">
              <span className="mr-1">{employee.siteIcon}</span>
              <span className="text-gray-700">{employee.site}</span>
            </div>
          </div>
          <div>
            <span className="text-gray-500">Salary:</span>
            <div className="font-medium text-gray-900 mt-1">{formatSalaryDisplay(employee.salary)}</div>
          </div>
          <div>
            <span className="text-gray-500">Start Date:</span>
            <div className="text-gray-700 mt-1">{employee.startDate}</div>
          </div>
          <div>
            <span className="text-gray-500">Lifecycle:</span>
            <div className="text-gray-700 mt-1">{employee.lifecycle}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeMobileCard;
