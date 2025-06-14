
import React from 'react';
import { ChevronRight, MoreVertical, CheckCircle, XCircle, Mail, Users, Phone, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Employee } from '../types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

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
    // Don't trigger card click when clicking interactive elements
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

  const statusConfig = {
    Active: { color: "bg-green-100 text-green-700 border-green-200", dot: "bg-green-500" },
    Inactive: { color: "bg-gray-100 text-gray-700 border-gray-200", dot: "bg-gray-400" },
    Invited: { color: "bg-blue-100 text-blue-700 border-blue-200", dot: "bg-blue-500" },
    Absent: { color: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const statusStyle = statusConfig[employee.status as keyof typeof statusConfig] || statusConfig.Inactive;

  return (
    <div 
      className={cn(
        "bg-white transition-all duration-200 cursor-pointer hover:bg-gray-50/80 active:bg-gray-100",
        "border-0 shadow-sm hover:shadow-md",
        isSelected && "bg-blue-50/80 ring-2 ring-blue-200",
        isExpanded && "shadow-lg"
      )}
      onClick={handleCardClick}
    >
      <div className="p-5">
        <div className="flex items-center justify-between">
          {/* Left side - Checkbox, Avatar, Info */}
          <div className="flex items-center space-x-4 flex-1" onClick={e => e.stopPropagation()}>
            <div className="flex-shrink-0">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onSelect(employee.id)}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
              />
            </div>
            
            <Avatar className="w-14 h-14 border-2 border-white shadow-md">
              <AvatarImage 
                src={employee.avatar} 
                alt={employee.name} 
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold text-lg">
                {getInitials(employee.name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-gray-900 truncate text-lg">
                  {employee.name}
                </h3>
                <div className={cn("w-2 h-2 rounded-full", statusStyle.dot)}></div>
              </div>
              <p className="text-gray-600 text-sm truncate mb-1">{employee.jobTitle}</p>
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="text-xs px-2 py-1">
                  {employee.department}
                </Badge>
                <span className="text-xs text-gray-500 flex items-center">
                  <span className="mr-1">{employee.siteIcon}</span>
                  {employee.site}
                </span>
              </div>
            </div>
          </div>
          
          {/* Right side - Actions */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {onStatusChange && (
              <div 
                onClick={e => e.stopPropagation()} 
                data-dropdown
              >
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors">
                    <MoreVertical className="w-5 h-5 text-gray-500" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => handleStatusChange('Active')} className="py-3">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                      <span>Set as Active</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange('Inactive')} className="py-3">
                      <XCircle className="mr-2 h-4 w-4 text-gray-600" />
                      <span>Set as Inactive</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange('Invited')} className="py-3">
                      <Mail className="mr-2 h-4 w-4 text-blue-600" />
                      <span>Set as Invited</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange('Absent')} className="py-3">
                      <Users className="mr-2 h-4 w-4 text-amber-600" />
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
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ChevronRight 
                className={cn(
                  "w-5 h-5 text-gray-600 transition-transform duration-200",
                  isExpanded && "transform rotate-90"
                )} 
              />
            </button>
          </div>
        </div>
        
        {/* Expanded Content */}
        {isExpanded && (
          <div className="mt-6 pt-5 border-t border-gray-100">
            <div className="grid grid-cols-1 gap-4">
              {/* Status Badge */}
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-500">Status:</span>
                <Badge className={cn("text-xs font-medium border", statusStyle.color)}>
                  {employee.status}
                </Badge>
              </div>
              
              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Department</p>
                  <p className="text-sm font-medium text-gray-900">{employee.department}</p>
                </div>
                
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Location</p>
                  <p className="text-sm font-medium text-gray-900 flex items-center">
                    <span className="mr-1">{employee.siteIcon}</span>
                    {employee.site}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Salary</p>
                  <p className="text-sm font-bold text-green-600">{employee.salary}</p>
                </div>
                
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Start Date</p>
                  <p className="text-sm font-medium text-gray-900">{employee.startDate}</p>
                </div>
                
                <div className="col-span-2">
                  <p className="text-xs font-medium text-gray-500 mb-1">Lifecycle</p>
                  <p className="text-sm font-medium text-gray-900">{employee.lifecycle}</p>
                </div>
              </div>
              
              {/* Contact Actions */}
              {(employee.email || employee.phone) && (
                <div className="flex space-x-2 pt-2">
                  {employee.email && (
                    <button className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors">
                      <Mail className="w-4 h-4" />
                      <span>Email</span>
                    </button>
                  )}
                  {employee.phone && (
                    <button className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors">
                      <Phone className="w-4 h-4" />
                      <span>Call</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeMobileCard;
