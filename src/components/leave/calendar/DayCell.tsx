
import React from "react";
import { format, isSameMonth, isToday } from "date-fns";
import type { LeaveCalendar } from "@/hooks/use-leave-calendar";
import { getTypeColor, getStatusColor } from "./utils";
import { Meeting } from "./utils/calendar-utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";

interface DayCellProps {
  day: Date | null;
  currentDate: Date;
  leaves: LeaveCalendar[];
  meetings?: Meeting[];
  getEmployeeName: (employeeId: string) => string;
}

const DayCell: React.FC<DayCellProps> = ({ 
  day, 
  currentDate, 
  leaves,
  meetings = [],
  getEmployeeName
}) => {
  const isMobile = useIsMobile();
  
  if (!day) {
    return <div className="aspect-square p-1 bg-gray-50"></div>;
  }
  
  const isCurrentMonth = isSameMonth(day, currentDate);
  const isCurrentDay = isToday(day);
  
  return (
    <div 
      className={`
        ${isMobile ? 'calendar-day-mobile' : 'aspect-square p-1'} 
        relative border
        ${isCurrentMonth ? "bg-white" : "bg-gray-50 text-gray-400"}
        ${isCurrentDay ? "border-blue-500 border-2" : "border-gray-100"}
      `}
    >
      <div className={`text-right ${isMobile ? 'p-0.5 text-[10px]' : 'text-xs p-1'}`}>
        {format(day, "d")}
      </div>
      
      {leaves.length > 0 && (
        <div className={`absolute bottom-1 left-1 right-1 ${isMobile ? 'bottom-0.5 left-0.5 right-0.5' : ''}`}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-wrap gap-1">
                  {leaves.slice(0, isMobile ? 2 : 3).map((leave, i) => (
                    <div 
                      key={`${leave.id}-${i}`}
                      className={`
                        ${isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'} 
                        rounded-full 
                        ${getTypeColor(leave.type)}
                        border-2 border-white
                      `}
                    ></div>
                  ))}
                  {leaves.length > (isMobile ? 2 : 3) && (
                    <div className={`${isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'} rounded-full bg-gray-300 flex items-center justify-center text-[8px]`}>
                      <span>+{leaves.length - (isMobile ? 2 : 3)}</span>
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[220px]">
                <div>
                  {leaves.map(leave => (
                    <div 
                      key={leave.id}
                      className="flex items-center gap-2 mb-1 text-xs"
                    >
                      <div className={`w-2 h-2 rounded-full ${getTypeColor(leave.type)}`}></div>
                      <span className="font-medium truncate max-w-[100px]">{getEmployeeName(leave.employee_id)}</span>
                      <span className="whitespace-nowrap">({leave.type})</span>
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
      
      {/* Show meetings if present */}
      {meetings && meetings.length > 0 && (
        <div className={`absolute top-5 left-1 right-1 ${isMobile ? 'top-4 left-0.5 right-0.5' : ''}`}>
          {meetings.length > 0 && (
            <div className={`w-full h-0.5 bg-blue-400 rounded-full ${isMobile ? 'mt-0.5' : 'mt-1'}`}></div>
          )}
        </div>
      )}
    </div>
  );
};

export default DayCell;
