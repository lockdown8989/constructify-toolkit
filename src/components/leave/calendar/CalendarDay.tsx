
import React from "react";
import { format, isSameMonth, isToday } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { LeaveCalendar } from "@/hooks/leave-calendar";

interface CalendarDayProps {
  day: Date | null;
  currentDate: Date;
  leaves: LeaveCalendar[];
  getEmployeeName: (employeeId: string) => string;
  getTypeColor: (type: string) => string;
  getStatusColor: (status: string) => string;
}

const CalendarDay: React.FC<CalendarDayProps> = ({ 
  day, 
  currentDate, 
  leaves, 
  getEmployeeName,
  getTypeColor,
  getStatusColor
}) => {
  if (!day) {
    return <div className="aspect-square p-1 bg-gray-50"></div>;
  }
  
  const isCurrentMonth = isSameMonth(day, currentDate);
  const isCurrentDay = isToday(day);
  
  const dayString = format(day, "yyyy-MM-dd");
  
  const dayLeaves = leaves.filter(leave => {
    const startDate = new Date(leave.start_date);
    const endDate = new Date(leave.end_date);
    
    return (
      dayString >= format(startDate, "yyyy-MM-dd") && 
      dayString <= format(endDate, "yyyy-MM-dd")
    );
  });
  
  return (
    <div 
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
};

export default CalendarDay;
