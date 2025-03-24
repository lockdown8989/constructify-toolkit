
import React from 'react';
import { cn } from '@/lib/utils';
import type { Employee } from '@/hooks/use-employees';

interface EmployeeSalaryCardProps {
  employee: Employee;
  isSelected: boolean;
  onClick: () => void;
}

const EmployeeSalaryCard: React.FC<EmployeeSalaryCardProps> = ({
  employee,
  isSelected,
  onClick
}) => {
  // Calculate a simplified progress value (just for visual representation)
  const progressValue = Math.floor(Math.random() * 80) + 10; // Random value between 10-90%
  
  return (
    <div 
      className={cn(
        "p-4 rounded-xl cursor-pointer transition-all",
        isSelected ? "bg-gray-100" : "hover:bg-gray-50"
      )}
      onClick={onClick}
    >
      <div className="flex items-center mb-2">
        <div className="w-12 h-12 rounded-full overflow-hidden mr-3 bg-gray-200">
          {employee.avatar ? (
            <img 
              src={employee.avatar} 
              alt={employee.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600">
              {employee.name.charAt(0)}
            </div>
          )}
        </div>
        
        <div>
          <h3 className="font-medium">{employee.name}</h3>
          <p className="text-sm text-gray-500">{employee.job_title}</p>
        </div>
      </div>
      
      <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
        <div 
          className="h-full bg-amber-400 rounded-full" 
          style={{ width: `${progressValue}%` }}
        />
        <div 
          className="h-full bg-gray-800 rounded-full ml-auto" 
          style={{ width: '20%', marginTop: '-8px' }}
        />
      </div>
    </div>
  );
};

export default EmployeeSalaryCard;
