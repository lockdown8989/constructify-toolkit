
import React from "react";
import type { LeaveCalendar } from "@/hooks/use-leave-calendar";
import { generateCalendarGrid, getLeavesForDay, getMeetingsForDay, Meeting } from "./utils/calendar-utils";
import DayNames from "./DayNames";
import DayCell from "./components/DayCell";
import { useIsMobile } from "@/hooks/use-mobile";

interface CalendarGridProps {
  currentDate: Date;
  leaves: LeaveCalendar[];
  getEmployeeName: (employeeId: string) => string;
  meetings?: Meeting[];
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ 
  currentDate, 
  leaves,
  getEmployeeName,
  meetings = []
}) => {
  const calendarWeeks = generateCalendarGrid(currentDate);
  const isMobile = useIsMobile();
  
  return (
    <div className={`grid grid-cols-7 ${isMobile ? 'gap-0.5 calendar-grid-mobile' : 'gap-1'}`}>
      {/* Day Names */}
      <DayNames />
      
      {/* Calendar Days */}
      {calendarWeeks.map((week, weekIndex) => (
        <React.Fragment key={weekIndex}>
          {week.map((day, dayIndex) => {
            const dayLeaves = getLeavesForDay(day, leaves);
            const dayMeetings = getMeetingsForDay(day, meetings);
            
            return (
              <DayCell 
                key={day ? day.toISOString() : `empty-${weekIndex}-${dayIndex}`}
                day={day}
                currentDate={currentDate}
                leaves={dayLeaves}
                meetings={dayMeetings}
                getEmployeeName={getEmployeeName}
              />
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
};

export default CalendarGrid;
