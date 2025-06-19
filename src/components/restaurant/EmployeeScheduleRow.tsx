import React from 'react';
import { Employee } from '@/types/restaurant-schedule';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Clock } from 'lucide-react';
import { OpenShiftType } from '@/types/supabase/schedules';
import { useRestaurantSchedule } from '@/hooks/use-restaurant-schedule';
import ShiftDialogManager from './ShiftDialogManager';

interface EmployeeScheduleRowProps {
  employee: Employee;
  days: string[];
  openShifts: OpenShiftType[];
  onAssignOpenShift: (openShiftId: string, employeeId?: string) => void;
  isMobile: boolean;
}

const EmployeeScheduleRow: React.FC<EmployeeScheduleRowProps> = ({
  employee,
  days,
  openShifts,
  onAssignOpenShift,
  isMobile
}) => {
  const { shifts, addShift, updateShift } = useRestaurantSchedule();
  
  // Get shifts for this employee
  const employeeShifts = shifts.filter(shift => shift.employeeId === employee.id);
  
  // Create shift dialog manager for this employee
  const shiftDialog = ShiftDialogManager({ 
    addShift, 
    updateShift,
    onResponseComplete: () => {
      // Force a refresh of the schedule data
      window.location.reload();
    }
  });

  const handleAddShift = (day: string) => {
    console.log('Adding shift for employee:', employee.id, 'on day:', day);
    shiftDialog.handleAddShift(employee.id, day);
  };

  const getShiftsForDay = (day: string) => {
    return employeeShifts.filter(shift => shift.day === day);
  };

  const renderDayCell = (day: string) => {
    const dayShifts = getShiftsForDay(day);
    const isAvailable = employee.availability[day as keyof typeof employee.availability]?.available || false;

    return (
      <div className="p-2 min-h-[80px] border-r border-gray-200 last:border-r-0 relative">
        {/* Availability indicator */}
        {isAvailable && (
          <div className="absolute top-1 right-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          </div>
        )}

        {/* Existing shifts */}
        <div className="space-y-1 mb-2">
          {dayShifts.map(shift => (
            <div
              key={shift.id}
              className="bg-blue-100 border border-blue-200 rounded p-1 text-xs cursor-pointer hover:bg-blue-200 transition-colors"
              onClick={() => shiftDialog.handleEditShift(shift)}
            >
              <div className="flex items-center gap-1 mb-1">
                <Clock className="h-3 w-3 text-blue-600" />
                <span className="font-medium text-blue-800">
                  {shift.startTime} - {shift.endTime}
                </span>
              </div>
              <div className="text-blue-700 truncate">
                {shift.role}
              </div>
              {shift.notes && (
                <div className="text-blue-600 text-xs truncate">
                  {shift.notes}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add shift button */}
        {isAvailable && (
          <Button
            onClick={() => handleAddShift(day)}
            variant="ghost"
            size="sm"
            className="w-full h-8 border-dashed border border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-600 hover:text-blue-600"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Shift
          </Button>
        )}

        {!isAvailable && dayShifts.length === 0 && (
          <div className="text-center text-gray-400 text-xs py-2">
            Not Available
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="grid grid-cols-8 hover:bg-gray-50 transition-colors">
        {/* Employee Info */}
        <div className="p-3 border-r border-gray-200 flex items-center">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
              style={{ backgroundColor: employee.color }}
            >
              {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            <div>
              <div className="font-medium text-sm text-gray-900">{employee.name}</div>
              <div className="text-xs text-gray-500">{employee.role}</div>
            </div>
          </div>
        </div>

        {/* Day cells */}
        {days.map(day => (
          <div key={`${employee.id}-${day}`}>
            {renderDayCell(day)}
          </div>
        ))}
      </div>

      {/* Shift Dialog */}
      {shiftDialog.ShiftDialogComponent}
    </>
  );
};

export default EmployeeScheduleRow;
