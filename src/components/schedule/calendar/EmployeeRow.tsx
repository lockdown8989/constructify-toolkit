
import React from 'react';
import { format, isToday } from 'date-fns';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import EmployeeShift from '../components/EmployeeShift';

interface EmployeeRowProps {
  employee: any;
  visibleDays: Date[];
  isAdmin: boolean;
  isManager: boolean;
  isHR: boolean;
  handleAddShift: (date: Date) => void;
  handleShiftClick: (shift: any) => void;
  handleEmployeeAddShift: (employeeId: string, date: Date) => void;
}

const EmployeeRow: React.FC<EmployeeRowProps> = ({
  employee,
  visibleDays,
  isAdmin,
  isManager,
  isHR,
  handleAddShift,
  handleShiftClick,
  handleEmployeeAddShift
}) => {
  return (
    <div className="flex">
      {/* Employee name column */}
      <div className="w-[120px] p-3 bg-gray-50 flex flex-col justify-center items-center text-center border-r border-gray-200">
        {employee.isCurrentUser ? (
          <div className="bg-gray-800 text-white px-3 py-1 rounded-md text-sm font-medium mb-1">
            You
          </div>
        ) : (
          <Avatar className="h-8 w-8 mb-1">
            <AvatarFallback className="bg-blue-100 text-blue-800">
              {employee.employeeName.split(' ').map((n: string) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
        )}
        <div className="font-medium text-sm">{employee.employeeName}</div>
        {employee.role && (
          <div className="text-xs text-gray-500 truncate max-w-[110px]">
            {employee.role}
          </div>
        )}
      </div>
      
      {/* Shifts columns */}
      <div className="flex flex-grow divide-x divide-gray-200">
        {visibleDays.map(day => {
          // Find shifts for this employee on this day
          const dayShifts = employee.shifts.filter((shift: any) => {
            const shiftDate = new Date(shift.start_time);
            return (
              shiftDate.getDate() === day.getDate() &&
              shiftDate.getMonth() === day.getMonth() &&
              shiftDate.getFullYear() === day.getFullYear()
            );
          });
          
          const isDayToday = isToday(day);
          
          // Generate a consistent color based on employee name
          const colorIndex = employee.employeeName.charCodeAt(0) % 5;
          const colorClasses = [
            'bg-blue-50 border-l-4 border-blue-500', // Blue
            'bg-yellow-50 border-l-4 border-yellow-500', // Yellow
            'bg-green-50 border-l-4 border-green-500', // Green
            'bg-pink-50 border-l-4 border-pink-500', // Pink
            'bg-purple-50 border-l-4 border-purple-500' // Purple
          ];
          const colorClass = colorClasses[colorIndex];
          
          return (
            <div 
              key={format(day, 'yyyy-MM-dd')} 
              className={cn(
                "w-full h-full min-h-[120px] p-2 relative",
                isDayToday ? "bg-blue-50/30" : ""
              )}
            >
              {dayShifts.length > 0 ? (
                <div className="space-y-2 h-full">
                  {dayShifts.map((shift: any) => (
                    <EmployeeShift 
                      key={shift.id}
                      shift={shift}
                      colorClass={colorClass}
                      onClick={() => handleShiftClick(shift)}
                    />
                  ))}
                </div>
              ) : (
                <div className={cn(
                  "h-full flex items-center justify-center",
                  (isAdmin || isManager || isHR) && "cursor-pointer hover:bg-gray-50"
                )}>
                  {(isAdmin || isManager || isHR) && (
                    <button
                      onClick={() => handleEmployeeAddShift(employee.employeeId, day)}
                      className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-gray-200 active:bg-gray-300"
                    >
                      <Plus className="h-5 w-5 text-gray-400" />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EmployeeRow;
