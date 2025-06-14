
import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Employee } from '@/hooks/use-employees';
import { formatCurrency } from '@/utils/format';

interface EmployeeSalaryCardProps {
  employee: Employee;
  isSelected: boolean;
  onClick: () => void;
  progressValue?: number;
}

const EmployeeSalaryCard: React.FC<EmployeeSalaryCardProps> = ({
  employee,
  isSelected,
  onClick,
  progressValue,
}) => {
  // Calculate a simplified progress value if not provided
  const progress = progressValue || Math.floor(Math.random() * 80) + 10; // Random value between 10-90%
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'leave':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'inactive':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };
  
  return (
    <div 
      className={cn(
        "p-4 rounded-xl cursor-pointer transition-all duration-200 border",
        isSelected 
          ? "bg-blue-50 border-blue-200 shadow-sm" 
          : "hover:bg-gray-50 border-gray-200 hover:border-gray-300 hover:shadow-sm"
      )}
      onClick={onClick}
    >
      {/* Header with Avatar and Basic Info */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={employee.avatar} alt={employee.name} />
            <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
              {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm truncate">
              {employee.name}
            </h3>
            <p className="text-xs text-gray-500 truncate">
              {employee.job_title}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {employee.department}
            </p>
          </div>
        </div>
        
        <Badge className={cn("text-xs", getStatusColor(employee.status))}>
          {employee.status}
        </Badge>
      </div>
      
      {/* Salary Information */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-gray-500">Annual Salary</span>
          <span className="text-sm font-bold text-gray-900">
            {formatCurrency(employee.salary, 'GBP')}
          </span>
        </div>
        
        {employee.hourly_rate && (
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-500">Hourly Rate</span>
            <span className="text-xs font-medium text-gray-700">
              {formatCurrency(employee.hourly_rate, 'GBP')}/hr
            </span>
          </div>
        )}
      </div>
      
      {/* Progress Indicator */}
      <div className="mt-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500">Payment Progress</span>
          <span className="text-xs text-gray-600">{progress}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      {/* Additional Info */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-500">Site</span>
          <span className="text-gray-700 font-medium">{employee.site}</span>
        </div>
        {employee.location && (
          <div className="flex justify-between items-center text-xs mt-1">
            <span className="text-gray-500">Location</span>
            <span className="text-gray-700">{employee.location}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeSalaryCard;
