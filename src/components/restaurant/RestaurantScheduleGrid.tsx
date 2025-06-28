
import React from 'react';
import { Employee, WeekStats, Shift } from '@/types/restaurant-schedule';
import { OpenShiftType } from '@/types/supabase/schedules';
import WeeklyGrid from './WeeklyGrid';

interface RestaurantScheduleGridProps {
  employees: Employee[];
  weekStats: WeekStats;
  openShifts: OpenShiftType[];
  formatCurrency: (amount: number) => string;
  handleAssignOpenShift: (openShiftId: string, employeeId?: string) => void;
  previousWeek: () => void;
  nextWeek: () => void;
  isMobile: boolean;
  addOpenShift: (openShift: Omit<OpenShiftType, 'id'>) => void;
  addShift: (shift: Omit<Shift, 'id'>) => void;
  updateShift: (id: string, updates: Partial<Shift>) => void;
  removeShift: (id: string) => void;
  onDateClick?: (date: Date) => void;
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
  removeShift,
  onDateClick
}) => {
  console.log('RestaurantScheduleGrid rendering with employees:', employees.length);
  
  if (!employees || employees.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border">
        <div className="text-gray-500 mb-4">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            It looks like you don't have any employees set up yet. Add employees to start creating schedules.
          </p>
        </div>
      </div>
    );
  }

  return (
    <WeeklyGrid
      employees={employees}
      weekStats={weekStats}
      openShifts={openShifts}
      formatCurrency={formatCurrency}
      handleAssignOpenShift={handleAssignOpenShift}
      previousWeek={previousWeek}
      nextWeek={nextWeek}
      isMobile={isMobile}
      addOpenShift={addOpenShift}
      addShift={addShift}
      updateShift={updateShift}
      removeShift={removeShift}
      onDateClick={onDateClick}
    />
  );
};

export default RestaurantScheduleGrid;
