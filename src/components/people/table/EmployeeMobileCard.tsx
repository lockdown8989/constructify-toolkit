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
        "w-full bg-white transition-all duration-300 ease-in-out",
        "rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1",
        isSelected && "bg-blue-50/80 ring-2 ring-blue-300",
        isExpanded && "shadow-xl"
      )}
    >
      <div className="p-3" onClick={handleCardClick}>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1 min-w-0">
            <div className="flex-shrink-0 pt-1" onClick={e => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onSelect(employee.id)}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-2"
              />
            </div>
            
            <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
              <AvatarImage 
                src={employee.avatar} 
                alt={employee.name} 
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                {getInitials(employee.name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-800 truncate text-base leading-tight">
                    {employee.name}
                  </h3>
                  <p className="text-gray-500 text-sm truncate">{employee.jobTitle}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2">
                <Badge variant="secondary" className="text-xs font-medium bg-gray-100 text-gray-700 border-gray-200/80">
                  {employee.department}
                </Badge>
                <span className="text-sm text-gray-500 flex items-center">
                  <span className="mr-1.5">{employee.siteIcon}</span>
                  {employee.site}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center space-y-2 ml-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
            {onStatusChange && (
              <div data-dropdown>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => handleStatusChange('Active')} className="py-2">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                      <span>Set as Active</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange('Inactive')} className="py-2">
                      <XCircle className="mr-2 h-4 w-4 text-gray-600" />
                      <span>Set as Inactive</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange('Invited')} className="py-2">
                      <Mail className="mr-2 h-4 w-4 text-blue-600" />
                      <span>Set as Invited</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange('Absent')} className="py-2">
                      <Users className="mr-2 h-4 w-4 text-amber-600" />
                      <span>Set as Absent</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
            
            <Button 
              onClick={(e) => { e.stopPropagation(); onToggleExpand(employee.id); }}
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 rounded-full bg-gray-100/80 transition-colors",
                isExpanded && "bg-blue-100"
              )}
            >
              <ChevronRight 
                className={cn(
                  "w-5 h-5 text-gray-600 transition-transform duration-300",
                  isExpanded && "transform rotate-90 text-blue-600"
                )} 
              />
            </Button>
          </div>
        </div>
        
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-100 pl-[52px]">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-500">Status:</span>
                <Badge className={cn("text-xs font-medium border", statusStyle.color)}>
                  {employee.status}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 bg-gray-50/70 rounded-xl p-3">
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
              
              {(employee.email || employee.phone) && (
                <div className="flex space-x-2 pt-2">
                  {employee.email && (
                    <Button variant="outline" size="sm" className="text-sm">
                      <Mail className="w-4 h-4 mr-2" />
                      <span>Email</span>
                    </Button>
                  )}
                  {employee.phone && (
                    <Button variant="outline" size="sm" className="text-sm">
                      <Phone className="w-4 h-4 mr-2" />
                      <span>Call</span>
                    </Button>
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
