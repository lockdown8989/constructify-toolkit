
import React from 'react';
import EmployeeRow from './EmployeeRow';

interface CalendarGridProps {
  allEmployeeSchedules: any[];
  visibleDays: Date[];
  isAdmin: boolean;
  isManager: boolean;
  isHR: boolean;
  handleAddShift: (date: Date) => void;
  handleShiftClick: (shift: any) => void;
  handleEmployeeAddShift: (employeeId: string, date: Date) => void;
  isLoading: boolean;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  allEmployeeSchedules,
  visibleDays,
  isAdmin,
  isManager,
  isHR,
  handleAddShift,
  handleShiftClick,
  handleEmployeeAddShift,
  isLoading
}) => {
  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading schedules...</div>;
  }

  if (allEmployeeSchedules.length === 0) {
    return <div className="p-8 text-center text-gray-500">No schedules found for the selected period</div>;
  }

  return (
    <div className="divide-y divide-gray-200">
      {allEmployeeSchedules.map((employee: any) => (
        <EmployeeRow
          key={employee.employeeId}
          employee={employee}
          visibleDays={visibleDays}
          isAdmin={isAdmin}
          isManager={isManager}
          isHR={isHR}
          handleAddShift={handleAddShift}
          handleShiftClick={handleShiftClick}
          handleEmployeeAddShift={handleEmployeeAddShift}
        />
      ))}
    </div>
  );
};

export default CalendarGrid;
