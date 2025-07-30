
import React, { useState } from "react";
import { format, isSameMonth, isToday } from "date-fns";
import type { LeaveCalendar } from "@/hooks/leave/leave-types";
import { getTypeColor } from "../utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import LeaveDetailsDrawer from "../LeaveDetailsDrawer";

interface DayCellProps {
  day: Date | null;
  currentDate: Date;
  leaves: LeaveCalendar[];
  getEmployeeName: (employeeId: string) => string;
  meetings?: any[];
}

const DayCell: React.FC<DayCellProps> = ({ 
  day, 
  currentDate, 
  leaves,
  getEmployeeName,
  meetings = []
}) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!day) {
    return <div className="aspect-square p-1 bg-gray-50"></div>;
  }
  
  const isCurrentMonth = isSameMonth(day, currentDate);
  const isCurrentDay = isToday(day);

  const handleDayClick = () => {
    if (leaves.length > 0) {
      setShowDetails(true);
    }
  };
  
  return (
    <>
      <div 
        className={`
          aspect-square p-1 relative border cursor-pointer transition-colors
          ${isCurrentMonth ? "bg-white hover:bg-gray-50" : "bg-gray-50 text-gray-400"}
          ${isCurrentDay ? "border-blue-500 border-2" : "border-gray-100"}
          ${leaves.length > 0 ? "hover:bg-blue-50" : ""}
        `}
        onClick={handleDayClick}
      >
      <div className="text-right text-xs p-1">
        {format(day, "d")}
      </div>
      
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
              <TooltipContent>
                <div className="max-w-xs">
                  {leaves.map(leave => (
                    <div 
                      key={leave.id}
                      className="flex items-center gap-2 mb-1 text-xs"
                    >
                      <div className={`w-2 h-2 rounded-full ${getTypeColor(leave.type)}`}></div>
                      <span className="font-medium">{getEmployeeName(leave.employee_id)}</span>
                      <span>({leave.type})</span>
                    </div>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
      </div>
      
      {showDetails && (
        <LeaveDetailsDrawer
          date={day}
          leaves={leaves}
          onClose={() => setShowDetails(false)}
          getEmployeeName={getEmployeeName}
        />
      )}
    </>
  );
};

export default DayCell;
