
import React from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import DayColumn from './DayColumn';
import WeekSummaryColumn from './WeekSummaryColumn';
import { Button } from '@/components/ui/button';
import { Employee, OpenShift, WeekStats } from '@/types/restaurant-schedule';
import { format } from 'date-fns';

interface WeeklyGridProps {
  weekStats: WeekStats;
  openShifts: OpenShift[];
  employees: Employee[];
  daysDisplayNames: string[];
  formatCurrency: (value: number) => string;
  handleAssignOpenShift: (openShiftId: string, employeeId?: string) => void;
  previousWeek: () => void;
  nextWeek: () => void;
  isMobile: boolean;
  isSyncingCalendar?: boolean;
}

const WeeklyGrid: React.FC<WeeklyGridProps> = ({
  weekStats,
  openShifts,
  employees,
  daysDisplayNames,
  formatCurrency,
  handleAssignOpenShift,
  previousWeek,
  nextWeek,
  isMobile,
  isSyncingCalendar = false
}) => {
  return (
    <div className="relative">
      {/* Week navigation */}
      <div className="flex justify-between items-center p-4 border-b">
        <Button 
          variant="ghost" 
          size={isMobile ? "sm" : "default"} 
          onClick={previousWeek}
          className="text-gray-600"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        
        <div className="flex flex-col items-center">
          <h2 className="text-lg font-medium">
            {format(weekStats.startDate, 'MMM d')} - {format(weekStats.endDate, 'MMM d, yyyy')}
          </h2>
          <div className="text-sm text-gray-500">
            Week {weekStats.weekNumber}
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size={isMobile ? "sm" : "default"}
          onClick={nextWeek}
          className="text-gray-600"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      
      {/* Day columns */}
      <div className="grid grid-cols-8 border-b divide-x">
        {/* Summary column */}
        <WeekSummaryColumn 
          totalHours={weekStats.totalHours}
          totalCost={weekStats.totalCost}
          formatCurrency={formatCurrency}
          openShiftsCount={weekStats.openShiftsTotalCount}
          openShiftsHours={weekStats.openShiftsTotalHours}
        />
        
        {/* Day columns */}
        {weekStats.days.map((dayStats, index) => (
          <DayColumn 
            key={dayStats.day}
            dayStats={dayStats}
            dayDisplayName={daysDisplayNames[index]}
            openShifts={openShifts.filter(s => s.day === dayStats.day)}
            employees={employees}
            handleAssignOpenShift={handleAssignOpenShift}
            formatCurrency={formatCurrency}
          />
        ))}
      </div>
      
      {/* Syncing with calendar overlay */}
      {isSyncingCalendar && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="bg-white rounded-xl shadow-md p-4 flex items-center space-x-3">
            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            <span className="text-gray-700 font-medium">Syncing with calendar...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyGrid;
