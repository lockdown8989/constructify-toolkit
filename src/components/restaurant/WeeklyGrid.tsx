
import React from 'react';
import { WeekStats, OpenShift, Employee } from '@/types/restaurant-schedule';
import WeekSummaryColumn from './WeekSummaryColumn';
import DayColumn from './DayColumn';
import EmployeeList from './EmployeeList';
import { useIsMobile } from '@/hooks/use-mobile';

interface WeeklyGridProps {
  weekStats: WeekStats;
  openShifts: OpenShift[];
  employees: Employee[];
  daysDisplayNames: string[];
  formatCurrency: (amount: number) => string;
  handleAssignOpenShift: (openShiftId: string, employeeId?: string) => void;
  previousWeek: () => void;
  nextWeek: () => void;
  isMobile?: boolean;
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
  isMobile = false
}: WeeklyGridProps) => {
  // For mobile, show only 4 days at a time and enable horizontal scrolling
  const visibleDays = isMobile ? weekStats.days.slice(0, 4) : weekStats.days;
  const visibleDayNames = isMobile ? daysDisplayNames.slice(0, 4) : daysDisplayNames;
  
  return (
    <div className={`${isMobile ? 'overflow-x-auto' : ''}`}>
      <div className={`grid ${isMobile ? 'grid-cols-6' : 'grid-cols-10'} gap-0 min-w-full`}>
        {/* Employee list column */}
        <EmployeeList employees={employees} />
        
        {/* Week summary column */}
        <WeekSummaryColumn 
          weekStats={weekStats} 
          openShifts={openShifts}
          formatCurrency={formatCurrency}
          handleAssignOpenShift={handleAssignOpenShift}
          previousWeek={previousWeek}
          nextWeek={nextWeek}
        />
        
        {/* Day columns */}
        {visibleDays.map((day, index) => (
          <DayColumn
            key={day.day}
            day={day}
            index={index}
            dayDisplayName={visibleDayNames[index]}
            formatCurrency={formatCurrency}
            openShifts={openShifts}
            onAssign={handleAssignOpenShift}
            previousWeek={index === 0 && !isMobile ? previousWeek : undefined}
            nextWeek={index === 1 && !isMobile ? nextWeek : undefined}
          />
        ))}
      </div>
      
      {/* Mobile pagination controls */}
      {isMobile && (
        <div className="flex justify-center mt-4 space-x-2 pb-2">
          <Button 
            onClick={previousWeek} 
            variant="outline" 
            size="sm" 
            className="h-9 w-9 p-0 rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center px-3 font-medium text-sm bg-gray-100 rounded-full">
            Week {weekStats.weekNumber}
          </div>
          <Button 
            onClick={nextWeek} 
            variant="outline" 
            size="sm" 
            className="h-9 w-9 p-0 rounded-full">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
};

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default WeeklyGrid;
