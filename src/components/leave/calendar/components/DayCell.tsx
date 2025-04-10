
import React from "react";
import { format, isSameMonth, isToday } from "date-fns";
import type { LeaveCalendar } from "@/hooks/use-leave-calendar";
import { getTypeColor, getStatusColor } from "../utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Meeting } from "../utils/calendar-utils";

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
  if (!day) {
    return <div className="aspect-square p-1 bg-gray-50"></div>;
  }
  
  const isCurrentMonth = isSameMonth(day, currentDate);
  const isCurrentDay = isToday(day);
  const hasMeetings = meetings.length > 0;
  
  return (
    <div 
      className={`
        aspect-square p-1 relative border
        ${isCurrentMonth ? "bg-white" : "bg-gray-50 text-gray-400"}
        ${isCurrentDay ? "border-blue-500 border-2" : "border-gray-100"}
        ${hasMeetings ? "bg-blue-50" : ""}
      `}
    >
      <div className="text-right text-xs p-1">
        {format(day, "d")}
      </div>
      
      {/* Meeting indicators */}
      {hasMeetings && (
        <div className="absolute top-5 left-1 right-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex justify-center">
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-[8px]">{meetings.length}</span>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                <div className="max-w-xs">
                  <div className="font-medium mb-1 text-sm">Meetings</div>
                  {meetings.map(meeting => (
                    <div 
                      key={meeting.id}
                      className="mb-1 text-xs border-l-2 border-blue-500 pl-2 py-1"
                    >
                      <div className="font-medium">{meeting.title}</div>
                      <div className="text-gray-500">{meeting.time.split(" ")[1]}</div>
                    </div>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
      
      {/* Leave indicators */}
      {leaves.length > 0 && (
        <div className="absolute bottom-1 left-1 right-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-wrap gap-1">
                  {leaves.slice(0, 3).map((leave, i) => (
                    <div 
                      key={`${leave.id}-${i}`}
                      className={`
                        w-2 h-2 rounded-full 
                        ${getTypeColor(leave.type)}
                        border-2 border-white
                      `}
                    ></div>
                  ))}
                  {leaves.length > 3 && (
                    <div className="w-2 h-2 rounded-full bg-gray-300 flex items-center justify-center text-[8px]">
                      <span>+{leaves.length - 3}</span>
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                <div className="max-w-xs">
                  {leaves.map(leave => (
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

export default DayCell;
