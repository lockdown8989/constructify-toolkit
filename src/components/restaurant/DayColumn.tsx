
import React from 'react';
import { DayStats, Employee, OpenShift } from '@/types/restaurant-schedule';
import ShiftBlock from './ShiftBlock';
import OpenShiftBlock from './OpenShiftBlock';
import { useIsMobile } from '@/hooks/use-mobile';

interface DayColumnProps {
  day: string;
  dayLabel: string;
  dayStats: DayStats;
  employees: Employee[];
  openShifts: OpenShift[];
  handleAssignOpenShift: (openShiftId: string, employeeId?: string) => void;
}

const DayColumn = ({
  day,
  dayLabel,
  dayStats,
  employees,
  openShifts,
  handleAssignOpenShift
}: DayColumnProps) => {
  const isMobile = useIsMobile();
  
  // Get all shifts for this day
  const shifts = dayStats.shifts;

  // Sort shifts by start time
  const sortedShifts = [...shifts].sort((a, b) => {
    return a.startTime.localeCompare(b.startTime);
  });
  
  // Format hours for display
  const formatHours = (totalHours: number) => {
    const hours = Math.floor(totalHours);
    const minutes = Math.round((totalHours - hours) * 60);
    
    if (minutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${minutes}m`;
    }
  };

  return (
    <div className="col-span-1 border-r border-gray-200">
      {/* Header */}
      <div className="p-2 sm:p-4 border-b border-gray-200 bg-gray-50">
        <div className="text-center">
          <div className="text-gray-600 font-medium text-sm sm:text-base">{dayLabel}</div>
          <div className="text-xs text-gray-500">{formatHours(dayStats.totalHours)}</div>
        </div>
      </div>
      
      {/* Shifts */}
      <div className="p-1 sm:p-2 flex flex-col gap-1 sm:gap-2 min-h-[100px]">
        {/* Employee shifts */}
        {sortedShifts.map(shift => {
          const employee = employees.find(e => e.id === shift.employeeId);
          if (!employee) return null;
          
          return (
            <ShiftBlock
              key={shift.id}
              shift={shift}
              employee={employee}
              compact={isMobile}
            />
          );
        })}
        
        {/* Open shifts */}
        {openShifts.map(openShift => (
          <OpenShiftBlock
            key={openShift.id}
            openShift={openShift}
            handleAssignOpenShift={handleAssignOpenShift}
            compact={isMobile}
          />
        ))}
        
        {/* Empty state */}
        {sortedShifts.length === 0 && openShifts.length === 0 && (
          <div className="p-2 text-center text-xs text-gray-400">
            No shifts
          </div>
        )}
      </div>
    </div>
  );
};

export default DayColumn;
