
import React from 'react';
import { ChevronRight, MoreVertical, CheckCircle, XCircle, Mail, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Employee } from '../types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EmployeeMobileCardProps {
  employee: Employee;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onCardClick?: (employee: Employee) => void;
  onStatusChange?: (id: string, status: string) => void;
}

const EmployeeMobileCard: React.FC<EmployeeMobileCardProps> = ({
  employee,
  isSelected,
  isExpanded,
  onSelect,
  onToggleExpand,
  onCardClick,
  onStatusChange,
}) => {
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click when clicking the checkbox, expand button, or dropdown
    if ((e.target as HTMLElement).tagName === 'INPUT' || 
        (e.target as HTMLElement).closest('input[type="checkbox"]') ||
        (e.target as HTMLElement).closest('button') ||
        (e.target as HTMLElement).closest('[data-dropdown]')) {
      return;
    }
    
    if (onCardClick) {
      onCardClick(employee);
    }
  };

  const handleStatusChange = (status: string) => {
    if (onStatusChange) {
      onStatusChange(employee.id, status);
    }
  };

  return (
    <div 
      className={cn(
        "p-4 transition-colors cursor-pointer",
        isSelected ? "bg-crextio-accent/10" : ""
      )}
      onClick={handleCardClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3" onClick={e => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(employee.id)}
            className="rounded border-gray-300 text-black focus:ring-black"
          />
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <img 
              src={employee.avatar} 
              alt={employee.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="font-medium">{employee.name}</div>
            <div className="text-sm text-gray-600">{employee.jobTitle}</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {onStatusChange && (
            <div onClick={e => e.stopPropagation()} data-dropdown>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100">
                  <MoreVertical className="w-4 h-4 text-gray-500" />
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
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(employee.id);
            }}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100"
          >
            <ChevronRight 
              className={cn(
                "w-4 h-4 text-gray-600 transition-transform",
                isExpanded ? "transform rotate-90" : ""
              )} 
            />
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="mt-4 pl-10 space-y-2 animate-fade-in">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-gray-500">Department:</div>
            <div>{employee.department}</div>
            
            <div className="text-gray-500">Site:</div>
            <div>{employee.site}</div>
            
            <div className="text-gray-500">Salary:</div>
            <div className="font-medium">{employee.salary}</div>
            
            <div className="text-gray-500">Start date:</div>
            <div>{employee.startDate}</div>
            
            <div className="text-gray-500">Lifecycle:</div>
            <div>{employee.lifecycle}</div>
            
            <div className="text-gray-500">Status:</div>
            <div>
              <span className={cn(
                "inline-block px-2 py-1 rounded-full text-xs font-medium",
                employee.statusColor === 'green' && "bg-crextio-success/20 text-green-700",
                employee.statusColor === 'gray' && "bg-gray-200 text-gray-700"
              )}>
                {employee.status}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeMobileCard;
