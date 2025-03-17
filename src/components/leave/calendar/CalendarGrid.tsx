
import React from "react";
import { 
  format, 
  isSameMonth,
  isToday,
  getDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval
} from "date-fns";
import type { LeaveCalendar } from "@/hooks/use-leave-calendar";
import { getTypeColor, getStatusColor } from "./utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CalendarGridProps {
  currentDate: Date;
  leaves: LeaveCalendar[];
  getEmployeeName: (employeeId: string) => string;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ 
  currentDate, 
  leaves,
  getEmployeeName
}) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Find the day of the week the month starts on (0 = Sunday, 1 = Monday, etc.)
  const startDay = getDay(monthStart);
  
  // Create a grid for the calendar
  const calendarGrid = [];
  
  // Add empty cells for days before the month starts
  for (let i = 0; i < startDay; i++) {
    calendarGrid.push(null);
  }
  
  // Add all days of the month
  monthDays.forEach(day => {
    calendarGrid.push(day);
  });
  
  // Add empty cells to complete the grid
  while (calendarGrid.length % 7 !== 0) {
    calendarGrid.push(null);
  }
  
  // Group days into weeks
  const calendarWeeks = [];
  for (let i = 0; i < calendarGrid.length; i += 7) {
    calendarWeeks.push(calendarGrid.slice(i, i + 7));
  }

  // Get leaves for a specific day
  const getLeavesForDay = (day: Date): LeaveCalendar[] => {
    if (!day) return [];
    
    return leaves.filter(leave => {
      const startDate = new Date(leave.start_date);
      const endDate = new Date(leave.end_date);
      
      // Check if the day falls within the leave period
      return day >= startDate && day <= endDate;
    });
  };

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
          {week.map((day, dayIndex) => {
            if (!day) {
              return (
                <div 
                  key={`empty-${weekIndex}-${dayIndex}`} 
                  className="aspect-square p-1 bg-gray-50"
                ></div>
              );
            }
            
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isCurrentDay = isToday(day);
            const dayLeaves = getLeavesForDay(day);
            
            return (
              <div 
                key={format(day, "yyyy-MM-dd")}
                className={`
                  aspect-square p-1 relative border
                  ${isCurrentMonth ? "bg-white" : "bg-gray-50 text-gray-400"}
                  ${isCurrentDay ? "border-blue-500 border-2" : "border-gray-100"}
                `}
              >
                <div className="text-right text-xs p-1">
                  {format(day, "d")}
                </div>
                
                {dayLeaves.length > 0 && (
                  <div className="absolute bottom-1 left-1 right-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex flex-wrap gap-1">
                            {dayLeaves.slice(0, 3).map((leave, i) => (
                              <div 
                                key={`${leave.id}-${i}`}
                                className={`
                                  w-2 h-2 rounded-full 
                                  ${getTypeColor(leave.type)}
                                  border-2 border-white
                                `}
                              ></div>
                            ))}
                            {dayLeaves.length > 3 && (
                              <div className="w-2 h-2 rounded-full bg-gray-300 flex items-center justify-center text-[8px]">
                                <span>+{dayLeaves.length - 3}</span>
                              </div>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <div className="max-w-xs">
                            {dayLeaves.map(leave => (
                              <div 
                                key={leave.id}
                                className="flex items-center gap-2 mb-1 text-xs"
                              >
                                <div className={`w-2 h-2 rounded-full ${getTypeColor(leave.type)}`}></div>
                                <span className="font-medium">{getEmployeeName(leave.employee_id)}</span>
                                <span>({leave.type})</span>
                                <div className={`px-1.5 py-0.5 rounded-sm text-[10px] text-white ${getStatusColor(leave.status)}`}>
                                  {leave.status}
                                </div>
                              </div>
                            ))}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
};

export default CalendarGrid;
