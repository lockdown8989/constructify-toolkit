
import React from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday } from 'date-fns';
import { Employee, Shift } from '@/types/restaurant-schedule';
import { OpenShiftType } from '@/types/supabase/schedules';
import { cn } from '@/lib/utils';

interface MonthlyScheduleViewProps {
  currentDate: Date;
  employees: Employee[];
  shifts: Shift[];
  openShifts: OpenShiftType[];
  onDateClick?: (date: Date) => void;
}

const MonthlyScheduleView: React.FC<MonthlyScheduleViewProps> = ({
  currentDate,
  employees,
  shifts,
  openShifts,
  onDateClick
}) => {
  // Get month boundaries
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  
  // Get the start and end of the calendar (including days from prev/next months)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start on Monday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  // Create calendar days array
  const calendarDays = [];
  let day = calendarStart;
  
  while (day <= calendarEnd) {
    calendarDays.push(day);
    day = addDays(day, 1);
  }
  
  // Generate weeks
  const weeks = [];
  let week = [];
  
  calendarDays.forEach((day, i) => {
    week.push(day);
    if ((i + 1) % 7 === 0 || i === calendarDays.length - 1) {
      weeks.push(week);
      week = [];
    }
  });
  
  // Get shifts for a specific day
  const getShiftsForDay = (day: Date) => {
    const dayString = format(day, 'yyyy-MM-dd');
    return shifts.filter(shift => {
      // Assuming shift has a date property or we derive it from shift.day
      return shift.day === format(day, 'EEEE').toLowerCase();
    });
  };

  // Handle date click
  const handleDateClick = (date: Date) => {
    if (onDateClick) {
      onDateClick(date);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Month header */}
      <div className="p-4 text-center font-semibold text-lg bg-gray-50 border-b">
        {format(currentDate, 'MMMM yyyy')}
      </div>
      
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b bg-gray-50">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
          <div key={i} className="p-3 text-center text-sm font-medium text-gray-700 border-r last:border-r-0">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="bg-white">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 border-b last:border-b-0">
            {week.map((day, dayIndex) => {
              const dayShifts = getShiftsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isDayToday = isToday(day);
              
              return (
                <div
                  key={dayIndex}
                  className={cn(
                    "min-h-[100px] border-r last:border-r-0 p-2 relative cursor-pointer transition-all hover:bg-gray-50",
                    !isCurrentMonth && "bg-gray-50/50 text-gray-400",
                    isDayToday && "bg-blue-50 border-blue-200"
                  )}
                  onClick={() => handleDateClick(day)}
                >
                  <div className={cn(
                    "text-right p-1 font-medium text-sm",
                    !isCurrentMonth && "text-gray-400",
                    isDayToday && "text-blue-600 font-bold"
                  )}>
                    {format(day, 'd')}
                  </div>
                  
                  {/* Shift indicators */}
                  <div className="space-y-1 mt-1">
                    {dayShifts.slice(0, 3).map((shift, i) => {
                      const employee = employees.find(e => e.id === shift.employeeId);
                      return (
                        <div
                          key={shift.id}
                          className="text-xs p-1 rounded bg-blue-100 text-blue-800 truncate"
                          style={{ backgroundColor: employee?.color ? `${employee.color}20` : undefined }}
                        >
                          {employee?.name} - {shift.startTime}
                        </div>
                      );
                    })}
                    
                    {dayShifts.length > 3 && (
                      <div className="text-xs text-center text-gray-500 font-medium">
                        +{dayShifts.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonthlyScheduleView;
