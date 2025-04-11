
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

  const statusColors = {
    green: "bg-apple-green/15 text-apple-green",
    gray: "bg-apple-gray-200 text-apple-gray-700"
  };

  return (
    <div 
      className={cn(
        "p-4 transition-colors cursor-pointer touch-target active:bg-apple-gray-50 border-b border-apple-gray-100 employee-card",
        isSelected ? "bg-apple-blue/5" : ""
      )}
      onClick={handleCardClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4" onClick={e => e.stopPropagation()}>
          <div className="touch-target flex items-center justify-center">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelect(employee.id)}
              className="rounded border-apple-gray-300 text-apple-blue focus:ring-apple-blue/30 w-5 h-5"
            />
          </div>
          <div className="w-12 h-12 rounded-full overflow-hidden border border-apple-gray-200 shadow-sm">
            <img 
              src={employee.avatar} 
              alt={employee.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="font-medium text-base text-apple-gray-900">{employee.name}</div>
            <div className="text-sm text-apple-gray-600">{employee.jobTitle}</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {onStatusChange && (
            <div 
              onClick={e => e.stopPropagation()} 
              data-dropdown 
              className="touch-target p-1"
            >
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-apple-gray-100">
                  <MoreVertical className="w-5 h-5 text-apple-gray-600" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white rounded-xl shadow-lg border-apple-gray-200">
                  <DropdownMenuItem onClick={() => handleStatusChange('Active')} className="py-3 focus:bg-apple-gray-50">
                    <CheckCircle className="mr-2 h-4 w-4 text-apple-green" />
                    <span>Set as Active</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange('Inactive')} className="py-3 focus:bg-apple-gray-50">
                    <XCircle className="mr-2 h-4 w-4 text-apple-gray-600" />
                    <span>Set as Inactive</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange('Invited')} className="py-3 focus:bg-apple-gray-50">
                    <Mail className="mr-2 h-4 w-4 text-apple-blue" />
                    <span>Set as Invited</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange('Absent')} className="py-3 focus:bg-apple-gray-50">
                    <Users className="mr-2 h-4 w-4 text-apple-orange" />
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
            className="flex items-center justify-center w-10 h-10 rounded-full bg-apple-gray-100 touch-target"
          >
            <ChevronRight 
              className={cn(
                "w-5 h-5 text-apple-gray-600 transition-transform",
                isExpanded ? "transform rotate-90" : ""
              )} 
            />
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="mt-5 pl-12 space-y-3 animate-fade-in">
          <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm bg-apple-gray-50 p-3 rounded-xl">
            <div className="text-apple-gray-500">Department:</div>
            <div className="text-apple-gray-900">{employee.department}</div>
            
            <div className="text-apple-gray-500">Site:</div>
            <div className="text-apple-gray-900">{employee.site}</div>
            
            <div className="text-apple-gray-500">Salary:</div>
            <div className="font-medium text-apple-gray-900">{employee.salary}</div>
            
            <div className="text-apple-gray-500">Start date:</div>
            <div className="text-apple-gray-900">{employee.startDate}</div>
            
            <div className="text-apple-gray-500">Lifecycle:</div>
            <div className="text-apple-gray-900">{employee.lifecycle}</div>
            
            <div className="text-apple-gray-500">Status:</div>
            <div>
              <span className={cn(
                "inline-block px-2 py-1 rounded-full text-xs font-medium",
                statusColors[employee.statusColor as keyof typeof statusColors]
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
