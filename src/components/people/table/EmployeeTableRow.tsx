
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Employee } from '../types';
import EmployeeStatusDropdown from '../modals/employee-details/EmployeeStatusDropdown';
import { useAuth } from '@/hooks/use-auth';

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
  const { isManager, isAdmin, isHR } = useAuth();
  const canEditStatus = isManager || isAdmin || isHR;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'on leave':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'invited':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'absent':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleStatusChange = (newStatus: string) => {
    console.log('Updating employee status:', employee.id, newStatus);
    if (onStatusChange) {
      onStatusChange(employee.id, newStatus);
    }
  };

  const handleRowClick = (e: React.MouseEvent) => {
    // Don't trigger row click if clicking on the checkbox or status dropdown
    if ((e.target as HTMLElement).closest('[data-prevent-row-click]')) {
      return;
    }
    
    if (onRowClick) {
      onRowClick(employee);
    }
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={handleRowClick}>
      <td className="px-4 py-3">
        <div data-prevent-row-click>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(employee.id)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>
      </td>
      
      <td className="px-4 py-3">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={employee.avatar} alt={employee.name} />
            <AvatarFallback className="text-xs">
              {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-gray-900">{employee.name}</div>
            <div className="text-sm text-gray-500">{employee.jobTitle}</div>
          </div>
        </div>
      </td>
      
      <td className="px-4 py-3 text-sm text-gray-900">{employee.department}</td>
      
      <td className="px-4 py-3 text-sm text-gray-900">{employee.site}</td>
      
      <td className="px-4 py-3 text-sm text-gray-900">
        <div className="flex items-center">
          <span className="text-gray-600">{employee.siteIcon}</span>
          <span className="ml-1">{employee.location}</span>
        </div>
      </td>
      
      <td className="px-4 py-3">
        <Badge 
          variant="outline" 
          className={cn("text-xs", getStatusColor(employee.status))}
        >
          {employee.status}
        </Badge>
      </td>
      
      <td className="px-4 py-3 text-sm text-gray-500">{employee.startDate}</td>
      
      <td className="px-4 py-3 text-sm text-gray-500">{employee.lifecycle}</td>
      
      <td className="px-4 py-3">
        {canEditStatus && (
          <div data-prevent-row-click>
            <EmployeeStatusDropdown
              currentStatus={employee.status}
              onStatusChange={handleStatusChange}
            />
          </div>
        )}
      </td>
    </tr>
  );
};

export default EmployeeTableRow;
