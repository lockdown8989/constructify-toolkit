
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
  isMobile?: boolean;
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
  isMobile = false
}: EmployeeRowProps) => {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const initials = employee.name.split(' ').map(n => n[0]).join('');
  const [expanded, setExpanded] = useState(false);
  
  // For mobile, show fewer days by default, or all days if expanded
  const visibleDays = isMobile ? (expanded ? days : days.slice(0, 5)) : days;
  
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      {/* Employee header row */}
      <div className={`flex items-center py-2 px-3 ${isMobile ? 'bg-gray-50/80' : ''}`}>
        <Avatar className="h-7 w-7 mr-2 border border-gray-200">
          <AvatarImage src={employee.avatarUrl} alt={employee.name} />
          <AvatarFallback className="bg-blue-100 text-blue-800 text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <span className="font-medium truncate max-w-[150px] text-sm text-gray-900">{employee.name}</span>
          <div className="flex items-center text-xs text-gray-500">
            <span className="font-medium text-gray-700 mr-2">{totalHours.toFixed(1)}h</span>
            <CheckCircle2 className="h-3 w-3 mr-1 text-green-600" />
            <span>{totalShifts} shifts</span>
          </div>
        </div>
        {isMobile && (
          <button 
            onClick={() => setExpanded(!expanded)}
            className="p-1 text-gray-500"
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
      
      {/* Days grid */}
      <div className={`grid ${isMobile ? 'grid-cols-5' : 'grid-cols-7'} gap-0 ${isMobile && !expanded ? '' : ''}`}>
        {/* Days columns */}
        {visibleDays.map((day) => (
          <div key={day} className="col-span-1 py-2 px-1 border-r border-gray-100 min-h-[100px]">
            <div className="text-xs font-medium text-gray-600 mb-1 text-center">
              {day.substring(0, 3)}
            </div>
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
              className="w-full py-1 px-2 text-xs text-center text-gray-500 hover:bg-gray-50 rounded-full mt-1 transition-colors"
            >
              +
            </button>
          </div>
        ))}
      </div>
      
      {/* Mobile view - show weekend days in a separate row if expanded */}
      {isMobile && expanded && (
        <div className="grid grid-cols-2 gap-0 bg-gray-50/30">
          {days.slice(5, 7).map((day) => (
            <div key={day} className="col-span-1 py-2 px-1 border-r border-gray-100 min-h-[100px]">
              <div className="text-xs font-medium text-gray-600 mb-1 text-center">
                {day.substring(0, 3)}
              </div>
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
                className="w-full py-1 px-2 text-xs text-center text-gray-500 hover:bg-gray-50 rounded-full mt-1 transition-colors"
              >
                +
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeRow;
