
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus, Calendar } from 'lucide-react';
import { WeekStats, Employee } from '@/types/restaurant-schedule';
import { OpenShiftType } from '@/types/supabase/schedules';
import EmployeeScheduleRow from './EmployeeScheduleRow';

interface RestaurantScheduleGridProps {
  employees: Employee[];
  weekStats: WeekStats;
  openShifts: OpenShiftType[];
  formatCurrency: (amount: number) => string;
  handleAssignOpenShift: (openShiftId: string, employeeId?: string) => void;
  previousWeek: () => void;
  nextWeek: () => void;
  isMobile: boolean;
  addOpenShift: (openShift: any) => void;
  addShift: (shift: any) => void;
  updateShift: (shift: any) => void;
  removeShift: (shiftId: string) => void;
}

const RestaurantScheduleGrid: React.FC<RestaurantScheduleGridProps> = ({
  employees,
  weekStats,
  openShifts,
  formatCurrency,
  handleAssignOpenShift,
  previousWeek,
  nextWeek,
  isMobile,
  addOpenShift,
  addShift,
  updateShift,
  removeShift
}) => {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  console.log('RestaurantScheduleGrid - employees:', employees);
  console.log('RestaurantScheduleGrid - weekStats:', weekStats);

  if (!employees || employees.length === 0) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Weekly Schedule</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={previousWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                {weekStats?.weekRange || 'Current Week'}
              </span>
              <Button variant="outline" size="sm" onClick={nextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Employees Found</h3>
            <p className="text-gray-500 mb-4">
              There are no employees available to schedule. Add employees to get started with scheduling.
            </p>
            <Button onClick={() => window.location.href = '/people'}>
              <Plus className="h-4 w-4 mr-2" />
              Add Employees
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Weekly Schedule</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={previousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              {weekStats?.weekRange || 'Current Week'}
            </span>
            <Button variant="outline" size="sm" onClick={nextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Desktop Header */}
        {!isMobile && (
          <div className="grid grid-cols-8 gap-0 mb-4">
            <div className="p-3 font-medium text-gray-700 bg-gray-50 border-r border-gray-200">
              Employee ({employees.length})
            </div>
            {dayNames.map(day => (
              <div key={day} className="p-3 font-medium text-gray-700 bg-gray-50 border-r border-gray-200 last:border-r-0 text-center">
                {day}
              </div>
            ))}
          </div>
        )}

        {/* Employee Rows */}
        <div className="space-y-0">
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

        {/* Week Summary */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium text-gray-900">Week Summary</h3>
              <p className="text-sm text-gray-600">
                Total Hours: {weekStats?.totalHours || 0} | 
                Total Cost: {formatCurrency(weekStats?.totalCost || 0)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                {employees.length} employees scheduled
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RestaurantScheduleGrid;
