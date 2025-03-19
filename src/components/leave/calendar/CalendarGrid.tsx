
import React from "react";
import { 
  getDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval
} from "date-fns";
import type { LeaveCalendar } from "@/hooks/leave-calendar";
import CalendarDay from "./CalendarDay";

interface CalendarGridProps {
  currentDate: Date;
  leaves: LeaveCalendar[];
  getEmployeeName: (employeeId: string) => string;
  getTypeColor: (type: string) => string;
  getStatusColor: (status: string) => string;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ 
  currentDate, 
  leaves,
  getEmployeeName,
  getTypeColor,
  getStatusColor
}) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const startDay = getDay(monthStart);
  
  const calendarGrid = [];
  
  // Fill in empty cells before the start of the month
  for (let i = 0; i < startDay; i++) {
    calendarGrid.push(null);
  }
  
  // Add all days of the month
  monthDays.forEach(day => {
    calendarGrid.push(day);
  });
  
  // Add empty cells after the end of the month to complete the grid
  while (calendarGrid.length % 7 !== 0) {
    calendarGrid.push(null);
  }
  
  // Group days into weeks
  const calendarWeeks = [];
  for (let i = 0; i < calendarGrid.length; i += 7) {
    calendarWeeks.push(calendarGrid.slice(i, i + 7));
  }
  
  return (
    <div className="grid grid-cols-7 gap-1">
      {/* Day Names */}
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
        <div key={day} className="text-center font-medium py-2 text-sm">
          {day}
        </div>
      ))}
      
      {/* Calendar Days */}
      {calendarWeeks.map((week, weekIndex) => (
        <React.Fragment key={weekIndex}>
          {week.map((day, dayIndex) => (
            <CalendarDay
              key={day ? day.toString() : `empty-${weekIndex}-${dayIndex}`}
              day={day}
              currentDate={currentDate}
              leaves={leaves}
              getEmployeeName={getEmployeeName}
              getTypeColor={getTypeColor}
              getStatusColor={getStatusColor}
            />
          ))}
        </React.Fragment>
      ))}
    </div>
  );
};

export default CalendarGrid;
