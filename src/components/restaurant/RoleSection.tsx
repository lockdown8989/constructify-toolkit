
import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { StaffRole, Shift } from '@/types/restaurant-schedule';
import EmployeeRow from './EmployeeRow';

interface RoleSectionProps {
  role: StaffRole;
  shifts: Record<string, Record<string, Shift[]>>;
  onEditShift: (shift: Shift) => void;
  onDeleteShift: (shiftId: string) => void;
  onAddShift: (employeeId: string, day: string) => void;
  onAddNote: (shiftId: string) => void;
  onAddBreak: (shiftId: string) => void;
}

const RoleSection = ({
  role,
  shifts,
  onEditShift,
  onDeleteShift,
  onAddShift,
  onAddNote,
  onAddBreak
}: RoleSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const calculateEmployeeStats = (employeeId: string) => {
    let totalHours = 0;
    let totalShifts = 0;
    
    Object.values(shifts[employeeId] || {}).forEach(dayShifts => {
      dayShifts.forEach(shift => {
        if (!shift.isUnavailable) {
          // Calculate hours for this shift
          const [startHour, startMinute] = shift.startTime.split(':').map(Number);
          const [endHour, endMinute] = shift.endTime.split(':').map(Number);
          
          const startMinutes = startHour * 60 + startMinute;
          const endMinutes = endHour * 60 + endMinute;
          
          const durationHours = (endMinutes - startMinutes) / 60;
          
          totalHours += durationHours;
          totalShifts += 1;
        }
      });
    });
    
    return { totalHours, totalShifts };
  };
  
  return (
    <div className="border rounded-xl mb-6 bg-white shadow-sm overflow-hidden">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          {isExpanded ? 
            <ChevronDown className="h-5 w-5 text-gray-500" /> : 
            <ChevronRight className="h-5 w-5 text-gray-500" />
          }
          <h3 className="font-medium text-gray-900">{role.name}</h3>
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span className="font-medium">{role.totalHours.toFixed(1)}h</span>
          <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">{role.totalShifts} shifts</span>
        </div>
      </div>
      
      {isExpanded && (
        <div>
          {role.employees.map(employee => {
            const stats = calculateEmployeeStats(employee.id);
            
            return (
              <EmployeeRow
                key={employee.id}
                employee={employee}
                totalHours={stats.totalHours}
                totalShifts={stats.totalShifts}
                shifts={shifts[employee.id] || {}}
                onEditShift={onEditShift}
                onDeleteShift={onDeleteShift}
                onAddShift={onAddShift}
                onAddNote={onAddNote}
                onAddBreak={onAddBreak}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RoleSection;
