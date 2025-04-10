
import React from 'react';
import { WeekStats, OpenShift } from '@/types/restaurant-schedule';
import WeekSummaryColumn from './WeekSummaryColumn';
import DayColumn from './DayColumn';

interface WeeklyGridProps {
  weekStats: WeekStats;
  openShifts: OpenShift[];
  daysDisplayNames: string[];
  formatCurrency: (amount: number) => string;
  handleAssignOpenShift: (openShiftId: string) => void;
  previousWeek: () => void;
  nextWeek: () => void;
}

const WeeklyGrid = ({
  weekStats,
  openShifts,
  daysDisplayNames,
  formatCurrency,
  handleAssignOpenShift,
  previousWeek,
  nextWeek
}: WeeklyGridProps) => {
  return (
    <div className="grid grid-cols-9 gap-0 border rounded-t-xl bg-white shadow-sm overflow-hidden">
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
