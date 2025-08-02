import React, { useState } from 'react';
import { Employee } from '@/types/restaurant-schedule';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Clock, ChevronDown, ChevronRight } from 'lucide-react';
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
  const { shifts, addShift, updateShift, removeShift } = useRestaurantSchedule();
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Get shifts for this employee
  const employeeShifts = shifts.filter(shift => shift.employeeId === employee.id);
  
  // Create wrapper for delete function to match expected signature
  const handleDeleteShift = async (shift: any) => {
    await removeShift(shift.id);
  };

  // Create shift dialog manager for this employee
  const shiftDialog = ShiftDialogManager({ 
    addShift, 
    updateShift,
    deleteShift: handleDeleteShift,
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

  const getAvailabilityForDay = (day: string) => {
    return employee.availability[day as keyof typeof employee.availability];
  };

  const renderDayCell = (day: string, dayIndex: number) => {
    const dayShifts = getShiftsForDay(day);
    const availability = getAvailabilityForDay(day);
    const isAvailable = availability?.available || false;

    return (
      <div className={`p-2 min-h-[80px] ${!isMobile ? 'border-r border-gray-200 last:border-r-0' : 'border-b border-gray-100'} relative transition-colors ${isAvailable ? 'bg-white hover:bg-gray-50/50' : 'bg-gray-50/80'}`}>
        {/* Mobile day header */}
        {isMobile && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-gray-600">{days[dayIndex]?.substring(0, 3)}</span>
            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`}>
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        )}

        {/* Desktop availability indicator - Enhanced */}
        {!isMobile && (
          <div className="absolute top-2 right-2">
            <div 
              className={`w-4 h-4 rounded-full flex items-center justify-center shadow-sm ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`} 
              title={isAvailable ? 'Available' : 'Not Available'}
            >
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        )}

        {/* Availability time display - Enhanced */}
        {isAvailable && availability && (
          <div className="text-xs text-gray-600 mb-2 font-medium">
            {availability.start} - {availability.end}
          </div>
        )}

        {/* Existing shifts */}
        <div className="space-y-1 mb-2">
          {dayShifts.map(shift => (
            <div
              key={shift.id}
              className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-xs cursor-pointer hover:bg-blue-100 transition-colors"
              onClick={() => shiftDialog.handleEditShift(shift)}
            >
              <div className="flex items-center gap-1 mb-1">
                <Clock className="h-3 w-3 text-blue-600" />
                <span className="font-medium text-blue-800">
                  {shift.startTime} - {shift.endTime}
                </span>
              </div>
              <div className="text-blue-700 font-medium">
                {shift.role}
              </div>
              {shift.notes && (
                <div className="text-blue-600 text-xs mt-1 truncate">
                  {shift.notes}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add shift button - only show if available */}
        {isAvailable && (
          <Button
            onClick={() => handleAddShift(day)}
            variant="ghost"
            size="sm"
            className="w-full h-8 border-dashed border border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-lg"
          >
            <Plus className="h-3 w-3 mr-1" />
            {isMobile ? "Add" : "Add Shift"}
          </Button>
        )}

        {/* Not available message - Enhanced */}
        {!isAvailable && dayShifts.length === 0 && (
          <div className="text-center text-red-600 text-xs py-2 rounded-lg bg-red-50 border border-red-200">
            Not Available
          </div>
        )}
      </div>
    );
  };

  if (isMobile) {
    return (
      <>
        <div className="bg-white border-b border-gray-200">
          {/* Employee Header */}
          <div 
            className="p-4 flex items-center justify-between cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium"
                style={{ backgroundColor: employee.color }}
              >
                {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
              <div>
                <div className="font-medium text-gray-900">{employee.name}</div>
                <div className="text-sm text-gray-500">{employee.role}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {employeeShifts.length} shifts
              </Badge>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-400" />
              )}
            </div>
          </div>

          {/* Mobile Schedule Grid */}
          {isExpanded && (
            <div className="px-4 pb-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {days.map((day, index) => (
                  <div key={`${employee.id}-${day}`} className="border border-gray-200 rounded-lg">
                    {renderDayCell(day, index)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Shift Dialog */}
        {shiftDialog.ShiftDialogComponent}
      </>
    );
  }

  return (
    <>
      <div className="grid grid-cols-8 hover:bg-gray-50/50 transition-colors">
        {/* Employee Info */}
        <div className="p-3 border-r border-gray-200 flex items-center bg-gray-50/30">
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
              <Badge variant="secondary" className="text-xs mt-1">
                {employeeShifts.length} shifts
              </Badge>
            </div>
          </div>
        </div>

        {/* Day cells */}
        {days.map((day, index) => (
          <div key={`${employee.id}-${day}`}>
            {renderDayCell(day, index)}
          </div>
        ))}
      </div>

      {/* Shift Dialog */}
      {shiftDialog.ShiftDialogComponent}
    </>
  );
};

export default EmployeeScheduleRow;
