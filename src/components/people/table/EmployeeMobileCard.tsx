
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

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
    Active: "bg-green-100 text-green-700 border border-green-200",
    Inactive: "bg-gray-100 text-gray-700 border border-gray-200",
    Invited: "bg-blue-100 text-blue-700 border border-blue-200",
    Absent: "bg-amber-100 text-amber-700 border border-amber-200",
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div 
      className={cn(
        "bg-white rounded-xl mb-2 transition-all duration-200 ease-in-out",
        "cursor-pointer touch-target employee-card",
        isSelected ? "bg-blue-50 ring-2 ring-blue-500 shadow-lg" : "shadow-sm hover:shadow-md border border-gray-100"
      )}
      onClick={handleCardClick}
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-center p-1">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onSelect(employee.id)}
                className="rounded border-apple-gray-300 text-blue-600 focus:ring-blue-500 w-5 h-5"
              />
            </div>
            <Avatar className="w-10 h-10 rounded-full border-2 border-white shadow-sm">
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
              <div className="font-medium text-base text-apple-gray-900">{employee.name}</div>
              <div className="text-sm text-apple-gray-600">{employee.jobTitle}</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            {onStatusChange && (
              <div 
                onClick={e => e.stopPropagation()} 
                data-dropdown 
                className="touch-target"
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="w-10 h-10 rounded-full">
                      <MoreVertical className="w-5 h-5 text-apple-gray-600" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-white rounded-xl shadow-lg border-apple-gray-200">
                    <DropdownMenuItem onClick={() => handleStatusChange('Active')} className="py-3 focus:bg-apple-gray-50">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                      <span>Set as Active</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange('Inactive')} className="py-3 focus:bg-apple-gray-50">
                      <XCircle className="mr-2 h-4 w-4 text-apple-gray-600" />
                      <span>Set as Inactive</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange('Invited')} className="py-3 focus:bg-apple-gray-50">
                      <Mail className="mr-2 h-4 w-4 text-blue-600" />
                      <span>Set as Invited</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange('Absent')} className="py-3 focus:bg-apple-gray-50">
                      <Users className="mr-2 h-4 w-4 text-amber-600" />
                      <span>Set as Absent</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
            
            <Button
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(employee.id);
              }}
              className="w-10 h-10 rounded-full"
            >
              <ChevronRight 
                className={cn(
                  "w-5 h-5 text-apple-gray-600 transition-transform",
                  isExpanded ? "transform rotate-90" : ""
                )} 
              />
            </Button>
          </div>
        </div>
        
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-100 pl-14 space-y-3 animate-fade-in">
            <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm">
              <div className="text-gray-500 font-medium">Department:</div>
              <div className="text-gray-900 truncate">{employee.department}</div>
              
              <div className="text-gray-500 font-medium">Site:</div>
              <div className="text-gray-900 truncate">{employee.site} {employee.siteIcon}</div>
              
              <div className="text-gray-500 font-medium">Salary:</div>
              <div className="font-medium text-gray-900">{employee.salary}</div>
              
              <div className="text-gray-500 font-medium">Start date:</div>
              <div className="text-gray-900">{employee.startDate}</div>
              
              <div className="text-gray-500 font-medium">Lifecycle:</div>
              <div className="text-gray-900">{employee.lifecycle}</div>
              
              <div className="text-gray-500 font-medium">Status:</div>
              <div>
                <span className={cn(
                  "inline-block px-2 py-1 rounded-full text-xs font-medium",
                  statusColors[employee.status as keyof typeof statusColors]
                )}>
                  {employee.status}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeMobileCard;
