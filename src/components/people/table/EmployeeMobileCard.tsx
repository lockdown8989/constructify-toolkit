
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Employee } from '../types';
import EmployeeStatusDropdown from '../modals/employee-details/EmployeeStatusDropdown';
import { useAuth } from '@/hooks/use-auth';

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
    console.log('Updating employee status (mobile):', employee.id, newStatus);
    if (onStatusChange) {
      onStatusChange(employee.id, newStatus);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking on the checkbox or status dropdown
    if ((e.target as HTMLElement).closest('[data-prevent-card-click]')) {
      return;
    }
    
    if (onRowClick) {
      onRowClick(employee);
    }
  };

  return (
    <div 
      className={cn(
        "employee-card bg-white border border-gray-200 rounded-lg p-4 space-y-3 cursor-pointer transition-all",
        "hover:border-gray-300 hover:shadow-sm",
        "touch-active:bg-gray-50",
        isSelected && "border-blue-500 bg-blue-50"
      )}
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <div data-prevent-card-click>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelect(employee.id)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
          
          <Avatar className="h-10 w-10">
            <AvatarImage src={employee.avatar} alt={employee.name} />
            <AvatarFallback className="text-sm">
              {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate">{employee.name}</h3>
            <p className="text-sm text-gray-500 truncate">{employee.jobTitle}</p>
          </div>
        </div>
        
        {canEditStatus && (
          <div data-prevent-card-click>
            <EmployeeStatusDropdown
              currentStatus={employee.status}
              onStatusChange={handleStatusChange}
            />
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-gray-500">Department:</span>
          <div className="font-medium text-gray-900">{employee.department}</div>
        </div>
        <div>
          <span className="text-gray-500">Site:</span>
          <div className="font-medium text-gray-900">{employee.site}</div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-gray-600">{employee.siteIcon}</span>
          <span className="text-sm text-gray-600">{employee.location}</span>
        </div>
        
        <Badge 
          variant="outline" 
          className={cn("text-xs", getStatusColor(employee.status))}
        >
          {employee.status}
        </Badge>
      </div>
      
      <div className="flex justify-between text-sm text-gray-500">
        <span>Started: {employee.startDate}</span>
        <span>{employee.lifecycle}</span>
      </div>
    </div>
  );
};

export default EmployeeMobileCard;
