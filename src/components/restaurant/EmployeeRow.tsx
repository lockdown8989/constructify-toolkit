
import { useState } from 'react';
import { CheckCircle2, ChevronRight, ChevronDown } from 'lucide-react';
import { Employee, Shift } from '@/types/restaurant-schedule';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ShiftBlock from './ShiftBlock';

interface EmployeeRowProps {
  employee: Employee;
  totalHours: number;
  totalShifts: number;
  shifts: Record<string, Shift[]>;
  onEditShift: (shift: Shift) => void;
  onDeleteShift: (shiftId: string) => void;
  onAddShift: (employeeId: string, day: string) => void;
  onAddNote: (shiftId: string) => void;
  onAddBreak: (shiftId: string) => void;
  isMobile?: boolean; // Added isMobile prop as optional
}

const EmployeeRow = ({
  employee,
  totalHours,
  totalShifts,
  shifts,
  onEditShift,
  onDeleteShift,
  onAddShift,
  onAddNote,
  onAddBreak,
  isMobile = false // Default value if not provided
}: EmployeeRowProps) => {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const initials = employee.name.split(' ').map(n => n[0]).join('');
  
  // For mobile, show fewer days
  const visibleDays = isMobile ? days.slice(0, 5) : days;
  
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <div className={`grid ${isMobile ? 'grid-cols-7' : 'grid-cols-9'} gap-0`}>
        {/* Employee info column */}
        <div className="col-span-1 py-3 px-4 border-r border-gray-100 bg-gray-50/50">
          <div className="flex flex-col items-start">
            <div className="flex items-center mb-2">
              <Avatar className="h-9 w-9 mr-2 border border-gray-200">
                <AvatarImage src={employee.avatarUrl} alt={employee.name} />
                <AvatarFallback className="bg-blue-100 text-blue-800">{initials}</AvatarFallback>
              </Avatar>
              <span className="font-medium truncate max-w-[150px] text-gray-900">{employee.name}</span>
            </div>
            <div className="flex flex-col text-sm text-gray-500">
              <span className="font-medium text-gray-700">{totalHours.toFixed(1)}h</span>
              <div className="flex items-center">
                <CheckCircle2 className="h-3 w-3 mr-1 text-green-600" />
                <span>{totalShifts} shifts</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Days columns */}
        {visibleDays.map((day) => (
          <div key={day} className="col-span-1 py-2 px-1 border-r border-gray-100 min-h-[120px]">
            {shifts[day]?.map((shift) => (
              <ShiftBlock
                key={shift.id}
                shift={shift}
                color="red"
                onEdit={onEditShift}
                onDelete={onDeleteShift}
                onAddNote={onAddNote}
                onAddBreak={onAddBreak}
              />
            ))}
            <button
              onClick={() => onAddShift(employee.id, day)}
              className="w-full py-1 px-2 text-sm text-center text-gray-500 hover:bg-gray-50 rounded-full mt-1 transition-colors"
            >
              +
            </button>
          </div>
        ))}

        {/* If not mobile, add the final Sunday column */}
        {!isMobile && (
          <div className="col-span-1 py-2 px-1 min-h-[120px]">
            {shifts['sunday']?.map((shift) => (
              <ShiftBlock
                key={shift.id}
                shift={shift}
                color="red"
                onEdit={onEditShift}
                onDelete={onDeleteShift}
                onAddNote={onAddNote}
                onAddBreak={onAddBreak}
              />
            ))}
            <button
              onClick={() => onAddShift(employee.id, 'sunday')}
              className="w-full py-1 px-2 text-sm text-center text-gray-500 hover:bg-gray-50 rounded-full mt-1 transition-colors"
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeRow;
