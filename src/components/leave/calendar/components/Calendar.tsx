
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLeaveCalendarState } from "@/hooks/leave/useLeaveCalendarState";
import CalendarHeader from "../CalendarHeader";
import CalendarLegend from "../CalendarLegend";
import { generateCalendarGrid, getLeavesForDay } from "../utils";
import DayCell from "./DayCell";
import DayNames from "./DayNames";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar as CalendarIcon } from "lucide-react";

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
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-10 w-[250px]" />
          <Skeleton className="h-4 w-[350px]" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }
  
  const calendarWeeks = generateCalendarGrid(currentDate);
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 mb-1">
          <CalendarIcon className="h-5 w-5 text-primary" />
          <CardTitle>Team Leave Calendar</CardTitle>
        </div>
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
        <div className="grid grid-cols-7 gap-1 mt-4 border rounded-md p-2 bg-card shadow-inner">
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

export default Calendar;
