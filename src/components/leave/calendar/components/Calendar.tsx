
import React from "react";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { useLeaveCalendarState } from "@/hooks/leave/useLeaveCalendarState";
import CalendarHeader from "../CalendarHeader";
import CalendarLegend from "../CalendarLegend";
import { generateCalendarGrid, getLeavesForDay } from "../utils";
import DayCell from "./DayCell";
import DayNames from "./DayNames";
import { format } from "date-fns";

const Calendar: React.FC = () => {
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
          {calendarWeeks.flatMap((week, weekIndex) => 
            week.map((day, dayIndex) => {
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
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Calendar;
