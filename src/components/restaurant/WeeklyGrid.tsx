
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

  if (isMobile) {
    // Mobile-first design with stacked layout
    return (
      <div className="bg-white rounded-lg overflow-hidden">
        {/* Mobile Week Navigation Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
          <Button
            onClick={previousWeek}
            variant="outline"
            size="sm"
            className="h-8 px-2 text-xs"
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>
          
          <div className="text-center flex-1 mx-2">
            <h3 className="text-sm font-semibold text-gray-900 leading-tight">
              {weekStats.weekRange}
            </h3>
            <p className="text-xs text-gray-600">
              {weekStats.totalHours}h • {formatCurrency(weekStats.totalCost)}
            </p>
          </div>
          
          <Button
            onClick={nextWeek}
            variant="outline"
            size="sm"
            className="h-8 px-2 text-xs"
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>

        {/* Mobile Employee List */}
        <div className="divide-y divide-gray-100">
          {employees.map(employee => (
            <EmployeeScheduleRow
              key={employee.id}
              employee={employee}
              days={days.slice(0, 5)} // Show only weekdays on mobile initially
              openShifts={openShifts}
              onAssignOpenShift={handleAssignOpenShift}
              isMobile={true}
            />
          ))}
        </div>

        {/* Mobile Weekly Summary */}
        <div className="bg-gray-50 p-3 border-t border-gray-200">
          <div className="text-center">
            <div className="text-sm font-medium text-gray-800">
              Weekly Total: {weekStats.totalHours}h
            </div>
            <div className="text-xs text-gray-600">
              {formatCurrency(weekStats.totalCost)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop layout with full grid
  return (
    <div className="bg-white rounded-lg overflow-hidden">
      {/* Desktop Week Navigation Header */}
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

      {/* Desktop Schedule Grid */}
      <div className="overflow-x-auto">
        {/* Header Row */}
        <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-50 min-w-[800px]">
          <div className="p-3 font-medium text-sm text-gray-700 border-r border-gray-200 min-w-[150px]">
            Employee
          </div>
          {days.map((day, index) => (
            <div key={day} className="p-3 text-center font-medium text-sm text-gray-700 border-r border-gray-200 last:border-r-0 min-w-[100px]">
              {daysDisplayNames[index]}
            </div>
          ))}
        </div>

        {/* Employee Rows */}
        <div className="divide-y divide-gray-200 min-w-[800px]">
          {employees.map(employee => (
            <EmployeeScheduleRow
              key={employee.id}
              employee={employee}
              days={days}
              openShifts={openShifts}
              onAssignOpenShift={handleAssignOpenShift}
              isMobile={false}
            />
          ))}
        </div>

        {/* Desktop Weekly Summary Row */}
        <div className="grid grid-cols-8 border-t-2 border-gray-300 bg-gray-50 min-w-[800px]">
          <div className="p-3 font-semibold text-sm text-gray-800 border-r border-gray-200 min-w-[150px]">
            Weekly Totals
          </div>
          {days.map(day => (
            <div key={`total-${day}`} className="p-3 text-center text-sm border-r border-gray-200 last:border-r-0 min-w-[100px]">
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
