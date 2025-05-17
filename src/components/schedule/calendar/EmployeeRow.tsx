
import React from 'react';
import { format, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/utils/format';
import ShiftActionsMenu from '../ShiftActionsMenu';

interface EmployeeRowProps {
  employee: any;
  visibleDays: Date[];
  isAdmin: boolean;
  isManager: boolean;
  isHR: boolean;
  handleAddShift: (date: Date) => void;
  handleShiftClick: (shift: any) => void;
  handleEmployeeAddShift: (employeeId: string, date: Date) => void;
  onDateClick?: (date: Date) => void; // Added this optional prop
}

const EmployeeRow: React.FC<EmployeeRowProps> = ({
  employee,
  visibleDays,
  isAdmin,
  isManager,
  isHR,
  handleAddShift,
  handleShiftClick,
  handleEmployeeAddShift,
  onDateClick
}) => {
  // Define hasManagerAccess for readability
  const hasManagerAccess = isAdmin || isManager || isHR;

  return (
    <div className="flex border-b border-gray-200 overflow-hidden" key={employee.employeeId}>
      {/* Employee column */}
      <div className="w-[120px] p-3 shrink-0 flex items-center border-r border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarImage src={employee.avatar || ''} alt={employee.name} />
            <AvatarFallback>{getInitials(employee.name)}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium truncate">{employee.name}</span>
        </div>
      </div>
      
      {/* Days columns */}
      {visibleDays.map(day => {
        // Find schedules for this employee on this day
        const shiftsForDay = employee.schedules.filter((shift: any) => 
          isSameDay(new Date(shift.start_time), day)
        );
        
        return (
          <div
            key={format(day, 'yyyy-MM-dd')}
            className={cn(
              "flex-1 min-h-16 p-1 relative border-r border-gray-100",
              hasManagerAccess ? "cursor-pointer hover:bg-gray-50" : ""
            )}
            onClick={hasManagerAccess && onDateClick ? () => onDateClick(day) : undefined}
          >
            {/* Display shifts for this day */}
            <div className="flex flex-col gap-1">
              {shiftsForDay.map((shift: any) => (
                <div 
                  key={shift.id}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering parent's onClick
                    handleShiftClick(shift);
                  }}
                  className={cn(
                    "text-xs py-1 px-2 rounded cursor-pointer flex items-center justify-between",
                    shift.status === 'pending' ? "bg-amber-100 text-amber-800" : 
                    shift.status === 'confirmed' ? "bg-green-100 text-green-800" : 
                    "bg-blue-100 text-blue-800"
                  )}
                >
                  <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                    {format(new Date(shift.start_time), 'h:mm a')} - {format(new Date(shift.end_time), 'h:mm a')}
                  </div>
                  
                  {hasManagerAccess && (
                    <ShiftActionsMenu
                      shift={shift}
                      onEdit={() => handleShiftClick(shift)}
                      onDelete={() => console.log('Delete shift:', shift.id)}
                      className="ml-1"
                    />
                  )}
                </div>
              ))}
            </div>
            
            {/* Add shift button for managers */}
            {hasManagerAccess && shiftsForDay.length === 0 && (
              <div 
                className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering parent's onClick
                  handleEmployeeAddShift(employee.employeeId, day);
                }}
              >
                <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 cursor-pointer">
                  <span className="text-xs font-bold">+</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default EmployeeRow;
