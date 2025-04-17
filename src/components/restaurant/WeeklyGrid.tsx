
import React from 'react';
import { WeekStats, Employee, OpenShift } from '@/types/restaurant-schedule';
import { days } from './utils/schedule-utils';
import DayColumn from './DayColumn';
import WeekSummaryColumn from './WeekSummaryColumn';
import { useIsMobile } from '@/hooks/use-mobile';

interface WeeklyGridProps {
  weekStats: WeekStats;
  openShifts: OpenShift[];
  employees: Employee[];
  daysDisplayNames: string[];
  formatCurrency: (amount: number, currency?: string, locale?: string) => string;
  handleAssignOpenShift: (openShiftId: string, employeeId?: string) => void;
  previousWeek: () => void;
  nextWeek: () => void;
  isMobile: boolean;
}

const WeeklyGrid = ({ 
  weekStats, 
  openShifts, 
  employees,
  daysDisplayNames,
  formatCurrency,
  handleAssignOpenShift,
  previousWeek,
  nextWeek,
  isMobile
}: WeeklyGridProps) => {
  // Filter open shifts by day
  const getOpenShiftsByDay = (day: string) => {
    return openShifts.filter(shift => shift.day === day);
  };

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <div className={`grid ${isMobile ? 'grid-cols-3' : 'grid-cols-8'} min-w-[600px]`}>
        {/* Summary column */}
        <WeekSummaryColumn 
          weekStats={weekStats} 
          openShifts={openShifts} 
          formatCurrency={formatCurrency}
          handleAssignOpenShift={handleAssignOpenShift}
          previousWeek={previousWeek}
          nextWeek={nextWeek}
        />
        
        {/* Only show 2 days at a time on mobile */}
        {days.slice(0, isMobile ? 2 : 7).map((day, index) => (
          <DayColumn 
            key={day}
            day={day}
            dayLabel={daysDisplayNames[index]}
            dayStats={weekStats.days.find(d => d.day === day)!}
            employees={employees}
            openShifts={getOpenShiftsByDay(day)}
            handleAssignOpenShift={handleAssignOpenShift}
          />
        ))}
      </div>
      
      {/* Mobile day pagination */}
      {isMobile && (
        <div className="flex justify-center mt-4 pb-4 gap-2">
          {[0, 1, 2, 3].map((index) => (
            <button 
              key={index}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${index === 0 ? 'bg-primary' : 'bg-gray-300'}`}
              // This would need to be implemented with state to show different day groups
              onClick={() => console.log(`Show days ${index * 2} to ${index * 2 + 1}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WeeklyGrid;
