
import React from 'react';
import { cn } from '@/lib/utils';
import { Employee } from '../types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

interface EmployeeDesktopCardProps {
  employee: Employee;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onCardClick?: (employee: Employee) => void;
}

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

const EmployeeDesktopCard: React.FC<EmployeeDesktopCardProps> = ({
  employee,
  isSelected,
  onSelect,
  onCardClick
}) => {
  
  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-noclick]')) {
      return;
    }
    onCardClick?.(employee);
  };
  
  const statusConfig = {
    Active: { color: "bg-green-100 text-green-800", dot: "bg-green-500" },
    Inactive: { color: "bg-gray-100 text-gray-700", dot: "bg-gray-400" },
    Invited: { color: "bg-blue-100 text-blue-800", dot: "bg-blue-500" },
    Absent: { color: "bg-amber-100 text-amber-800", dot: "bg-amber-500" },
  };
  const statusStyle = statusConfig[employee.status as keyof typeof statusConfig] || statusConfig.Inactive;

  return (
    <div 
      className={cn(
        "bg-white rounded-2xl shadow-md p-4 flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer border",
        isSelected ? "border-blue-300 ring-2 ring-blue-200" : "border-gray-100"
      )}
      onClick={handleCardClick}
    >
      <div className="flex items-center justify-between mb-4" data-noclick>
        <div className="flex items-center space-x-2">
          <Checkbox checked={isSelected} onCheckedChange={() => onSelect(employee.id)} id={`select-desktop-${employee.id}`} aria-label={`Select ${employee.name}`} />
          <Badge variant="secondary" className={cn(statusStyle.color, "border-0 font-medium text-xs")}>{employee.status}</Badge>
        </div>
        <div className={cn("w-2.5 h-2.5 rounded-full", statusStyle.dot)} />
      </div>

      <div className="flex flex-col items-center text-center flex-grow">
        <Avatar className="w-20 h-20 mb-3 border-4 border-white shadow-lg">
          <AvatarImage src={employee.avatar} alt={employee.name} />
          <AvatarFallback className="text-2xl bg-gray-100">{getInitials(employee.name)}</AvatarFallback>
        </Avatar>
        <h3 className="font-semibold text-lg text-gray-800">{employee.name}</h3>
        <p className="text-gray-500 text-sm">{employee.jobTitle}</p>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 text-sm">
        <div className="flex justify-between mb-2">
          <span className="text-gray-500">Department</span>
          <span className="font-medium text-gray-700">{employee.department}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Site</span>
          <span className="font-medium text-gray-700 flex items-center">
            {employee.siteIcon} <span className="ml-1.5">{employee.site}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDesktopCard;

