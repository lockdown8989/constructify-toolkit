
import React from "react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { useLeaveCalendarState } from "@/hooks/leave/useLeaveCalendarState";
import CalendarHeader from "./calendar/CalendarHeader";
import CalendarLegend from "./calendar/CalendarLegend";
import DayCell from "./calendar/DayCell";
import DayNames from "./calendar/DayNames";
import { generateCalendarGrid, getLeavesForDay } from "./calendar/utils";

const LeaveCalendarView: React.FC = () => {
  const {
    currentDate,
    leaves,
    isLoading,
    handlePrevMonth,
    handleNextMonth,
    getEmployeeName
  } = useLeaveCalendarState();
  
  if (isLoading) {
    return <div className="flex justify-center p-6">Loading...</div>;
  }
  
  const calendarWeeks = generateCalendarGrid(currentDate);
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CalendarHeader 
          currentDate={currentDate}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />
        <CardDescription>
          Color-coded employee leave calendar
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Calendar Legend */}
        <CalendarLegend />
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day Names */}
          <DayNames />
          
          {/* Calendar Days */}
          {calendarWeeks.map((week, weekIndex) => (
            <React.Fragment key={weekIndex}>
              {week.map((day, dayIndex) => {
                const dayLeaves = day ? getLeavesForDay(day, leaves) : [];
                
                return (
                  <DayCell 
                    key={day ? format(day, "yyyy-MM-dd") : `empty-${weekIndex}-${dayIndex}`}
                    day={day}
                    currentDate={currentDate}
                    leaves={dayLeaves}
                    getEmployeeName={getEmployeeName}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LeaveCalendarView;
