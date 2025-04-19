
import React, { useState } from 'react';
import { WeekStats, Employee, OpenShift } from '@/types/restaurant-schedule';
import { days } from './utils/schedule-utils';
import DayColumn from './DayColumn';
import WeekSummaryColumn from './WeekSummaryColumn';
import { useIsMobile } from '@/hooks/use-mobile';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const [currentDayGroup, setCurrentDayGroup] = useState(0);
  
  // Get visible days based on current group (for mobile pagination)
  const getVisibleDays = () => {
    if (!isMobile) return days;
    const start = currentDayGroup * 2;
    return days.slice(start, start + 2);
  };

  // Filter open shifts by day
  const getOpenShiftsByDay = (day: string) => {
    return openShifts.filter(shift => shift.day === day);
  };

  // Navigate to previous day group on mobile
  const previousDayGroup = () => {
    setCurrentDayGroup(prev => (prev === 0 ? 3 : prev - 1));
  };

  // Navigate to next day group on mobile
  const nextDayGroup = () => {
    setCurrentDayGroup(prev => (prev === 3 ? 0 : prev + 1));
  };

  const visibleDays = getVisibleDays();

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
        {visibleDays.map((day, index) => {
          // Calculate the actual day index for getting the correct day label
          const dayIndex = isMobile ? currentDayGroup * 2 + index : index;
          
          return (
            <DayColumn 
              key={day}
              day={day}
              dayLabel={daysDisplayNames[dayIndex]}
              dayStats={weekStats.days.find(d => d.day === day)!}
              employees={employees}
              openShifts={getOpenShiftsByDay(day)}
              handleAssignOpenShift={handleAssignOpenShift}
            />
          );
        })}
      </div>
      
      {/* Mobile day pagination - with improved navigation UI */}
      {isMobile && (
        <div className="mt-4 pb-4 flex items-center justify-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={previousDayGroup}
            className="mr-2"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex justify-center gap-2">
            {[0, 1, 2, 3].map((index) => (
              <button 
                key={index}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${index === currentDayGroup ? 'bg-primary' : 'bg-gray-300'}`}
                onClick={() => setCurrentDayGroup(index)}
                aria-label={`Show days ${index * 2 + 1} to ${index * 2 + 2}`}
              />
            ))}
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={nextDayGroup}
            className="ml-2"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default WeeklyGrid;
