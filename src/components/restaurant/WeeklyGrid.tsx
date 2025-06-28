
import React from 'react';
import { Employee, WeekStats } from '@/types/restaurant-schedule';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar, Grid3X3, List } from 'lucide-react';
import EmployeeScheduleRow from './EmployeeScheduleRow';
import { OpenShiftType } from '@/types/supabase/schedules';
import MonthlyScheduleView from './views/MonthlyScheduleView';
import ListView from './views/ListView';

interface WeeklyGridProps {
  employees: Employee[];
  weekStats: WeekStats;
  openShifts: OpenShiftType[];
  formatCurrency: (amount: number) => string;
  handleAssignOpenShift: (openShiftId: string, employeeId?: string) => void;
  previousWeek: () => void;
  nextWeek: () => void;
  isMobile: boolean;
  addShift: (shift: any) => void;
  updateShift: (id: string, updates: any) => void;
  removeShift: (id: string) => void;
  onDateClick?: (date: Date) => void;
  currentView?: 'week' | 'month' | 'list';
  onViewChange?: (view: 'week' | 'month' | 'list') => void;
}

const WeeklyGrid: React.FC<WeeklyGridProps> = ({
  employees,
  weekStats,
  openShifts,
  formatCurrency,
  handleAssignOpenShift,
  previousWeek,
  nextWeek,
  isMobile,
  addShift,
  updateShift,
  removeShift,
  onDateClick,
  currentView = 'week',
  onViewChange
}) => {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const daysDisplayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Week Navigation Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-b border-gray-200 bg-gray-50/50 rounded-t-xl">
        <div className="flex items-center gap-2 mb-3 sm:mb-0">
          <Button
            onClick={previousWeek}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 h-9 px-3 rounded-lg"
          >
            <ChevronLeft className="h-4 w-4" />
            {!isMobile && "Previous"}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 h-9 px-3 rounded-lg"
          >
            <Calendar className="h-4 w-4" />
            {!isMobile && "Today"}
          </Button>
          
          <Button
            onClick={nextWeek}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 h-9 px-3 rounded-lg"
          >
            {!isMobile && "Next"}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            {weekStats.weekRange}
          </h3>
          <p className="text-sm text-gray-600">
            {weekStats.totalHours}h • {formatCurrency(weekStats.totalCost)}
          </p>
        </div>
        
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 mt-3 sm:mt-0">
          <Button 
            variant={currentView === 'week' ? "default" : "ghost"} 
            size="sm" 
            className="h-8 px-3 rounded-md"
            onClick={() => onViewChange?.('week')}
          >
            <Grid3X3 className="h-3 w-3 mr-1" />
            Week
          </Button>
          <Button 
            variant={currentView === 'month' ? "default" : "ghost"} 
            size="sm" 
            className="h-8 px-3 rounded-md"
            onClick={() => onViewChange?.('month')}
          >
            <Calendar className="h-3 w-3 mr-1" />
            Month
          </Button>
          <Button 
            variant={currentView === 'list' ? "default" : "ghost"} 
            size="sm" 
            className="h-8 px-3 rounded-md"
            onClick={() => onViewChange?.('list')}
          >
            <List className="h-3 w-3 mr-1" />
            List
          </Button>
        </div>
      </div>

      {/* Conditional Rendering Based on View */}
      {currentView === 'month' && (
        <MonthlyScheduleView
          currentDate={weekStats.startDate}
          employees={employees}
          shifts={[]} // You might need to pass actual shifts data here
          openShifts={openShifts}
          onDateClick={onDateClick}
        />
      )}

      {currentView === 'list' && (
        <ListView
          employees={employees}
          shifts={[]} // You might need to pass actual shifts data here
          openShifts={openShifts}
          weekStats={weekStats}
          formatCurrency={formatCurrency}
        />
      )}

      {currentView === 'week' && (
        <div className="overflow-hidden">
          {/* Header Row - Hidden on mobile */}
          {!isMobile && (
            <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-50/30">
              <div className="p-3 font-medium text-sm text-gray-700 border-r border-gray-200">
                Employee
              </div>
              {days.map((day, index) => (
                <div key={day} className="p-3 text-center font-medium text-sm text-gray-700 border-r border-gray-200 last:border-r-0">
                  <div className="font-semibold">{daysDisplayNames[index]}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {weekStats.dailyHours[day] || 0}h
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Employee Rows */}
          <div className="divide-y divide-gray-100">
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

          {/* Weekly Summary Row - Desktop only */}
          {!isMobile && (
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
          )}
        </div>
      )}
    </div>
  );
};

export default WeeklyGrid;
