
import React from 'react';
import { Employee, OpenShift } from '@/types/restaurant-schedule';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import EmployeeScheduleRow from './EmployeeScheduleRow';
import { OpenShiftType } from '@/types/supabase/schedules';

interface WeeklyGridProps {
  weekStats: any;
  openShifts: OpenShiftType[];
  employees: Employee[];
  daysDisplayNames: string[];
  formatCurrency: (amount: number) => string;
  handleAssignOpenShift: (openShiftId: string, employeeId?: string) => void;
  previousWeek: () => void;
  nextWeek: () => void;
  isMobile: boolean;
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
  isMobile
}) => {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <div className="bg-white rounded-lg">
      {/* Week Navigation Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <Button
          onClick={previousWeek}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous Week
        </Button>
        
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Week of {weekStats.weekRange}
          </h3>
          <p className="text-sm text-gray-600">
            {weekStats.totalHours}h • {formatCurrency(weekStats.totalCost)}
          </p>
        </div>
        
        <Button
          onClick={nextWeek}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          Next Week
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Schedule Grid */}
      <div className="overflow-x-auto">
        {/* Header Row */}
        <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-50">
          <div className="p-3 font-medium text-sm text-gray-700 border-r border-gray-200">
            Employee
          </div>
          {days.map((day, index) => (
            <div key={day} className="p-3 text-center font-medium text-sm text-gray-700 border-r border-gray-200 last:border-r-0">
              {daysDisplayNames[index]}
            </div>
          ))}
        </div>

        {/* Employee Rows */}
        <div className="divide-y divide-gray-200">
          {employees.map(employee => (
            <EmployeeScheduleRow
              key={employee.id}
              employee={employee}
              days={days}
              openShifts={openShifts}
              onAssignOpenShift={handleAssignOpenShift}
              isMobile={isMobile}
            />
          ))}
        </div>

        {/* Weekly Summary Row */}
        <div className="grid grid-cols-8 border-t-2 border-gray-300 bg-gray-50">
          <div className="p-3 font-semibold text-sm text-gray-800 border-r border-gray-200">
            Weekly Totals
          </div>
          {days.map(day => (
            <div key={`total-${day}`} className="p-3 text-center text-sm border-r border-gray-200 last:border-r-0">
              <div className="font-medium text-gray-800">
                {weekStats.dailyHours[day] || 0}h
              </div>
              <div className="text-xs text-gray-600">
                {formatCurrency(weekStats.dailyCosts[day] || 0)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeeklyGrid;
