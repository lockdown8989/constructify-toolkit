
import React from 'react';
import { WeekStats, OpenShift, Employee } from '@/types/restaurant-schedule';
import WeekSummaryColumn from './WeekSummaryColumn';
import DayColumn from './DayColumn';
import EmployeeList from './EmployeeList';

interface WeeklyGridProps {
  weekStats: WeekStats;
  openShifts: OpenShift[];
  employees: Employee[];
  daysDisplayNames: string[];
  formatCurrency: (amount: number) => string;
  handleAssignOpenShift: (openShiftId: string, employeeId: string) => void;
  previousWeek: () => void;
  nextWeek: () => void;
}

const WeeklyGrid = ({
  weekStats,
  openShifts,
  employees,
  daysDisplayNames,
  formatCurrency,
  handleAssignOpenShift,
  previousWeek,
  nextWeek
}: WeeklyGridProps) => {
  return (
    <div className="grid grid-cols-10 gap-0 border rounded-t-xl bg-white shadow-sm overflow-hidden">
      {/* Employee list column */}
      <EmployeeList employees={employees} />
      
      <WeekSummaryColumn 
        weekStats={weekStats} 
        openShifts={openShifts}
        formatCurrency={formatCurrency}
        handleAssignOpenShift={handleAssignOpenShift}
      />
      
      {weekStats.days.map((day, index) => (
        <DayColumn
          key={day.day}
          day={day}
          index={index}
          dayDisplayName={daysDisplayNames[index]}
          formatCurrency={formatCurrency}
          openShifts={openShifts}
          onAssign={handleAssignOpenShift}
          previousWeek={index === 0 ? previousWeek : undefined}
          nextWeek={index === 1 ? nextWeek : undefined}
        />
      ))}
    </div>
  );
};

export default WeeklyGrid;
