
import React, { useState } from "react";
import { addMonths, subMonths, format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, getDay } from "date-fns";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import { useLeaveCalendar } from "@/hooks/leave-calendar";
import { useEmployees } from "@/hooks/use-employees";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { LeaveCalendar } from "@/hooks/leave-calendar";

const LeaveCalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Calculate the first and last day of the current month
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const firstDayOfMonth = format(monthStart, 'yyyy-MM-dd');
  const lastDayOfMonth = format(monthEnd, 'yyyy-MM-dd');
  
  const { data: leaves = [], isLoading: isLoadingLeaves } = useLeaveCalendar(firstDayOfMonth, lastDayOfMonth);
  const { data: employees = [], isLoading: isLoadingEmployees } = useEmployees();
  
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const startDay = getDay(monthStart);
  
  const calendarGrid = [];
  
  for (let i = 0; i < startDay; i++) {
    calendarGrid.push(null);
  }
  
  monthDays.forEach(day => {
    calendarGrid.push(day);
  });
  
  while (calendarGrid.length % 7 !== 0) {
    calendarGrid.push(null);
  }
  
  const calendarWeeks = [];
  for (let i = 0; i < calendarGrid.length; i += 7) {
    calendarWeeks.push(calendarGrid.slice(i, i + 7));
  }
  
  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };
  
  const getEmployeeName = (employeeId: string): string => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.name : "Unknown Employee";
  };
  
  const getLeavesForDay = (day: Date): LeaveCalendar[] => {
    if (!day) return [];
    
    const dayString = format(day, "yyyy-MM-dd");
    
    return leaves.filter(leave => {
      const startDate = new Date(leave.start_date);
      const endDate = new Date(leave.end_date);
      
      return (
        dayString >= format(startDate, "yyyy-MM-dd") && 
        dayString <= format(endDate, "yyyy-MM-dd")
      );
    });
  };
  
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "Approved":
        return "bg-green-500";
      case "Rejected":
        return "bg-red-500";
      default:
        return "bg-yellow-500";
    }
  };
  
  const getTypeColor = (type: string): string => {
    switch (type) {
      case "Holiday":
        return "bg-blue-500";
      case "Sickness":
        return "bg-red-500";
      case "Personal":
        return "bg-purple-500";
      case "Parental":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };
  
  if (isLoadingLeaves || isLoadingEmployees) {
    return <div className="flex justify-center p-6">Loading...</div>;
  }
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Leave Calendar</CardTitle>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handlePrevMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center px-4 font-medium">
              {format(currentDate, "MMMM yyyy")}
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleNextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription>
          Color-coded employee leave calendar
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-xs">Holiday</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-xs">Sickness</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-xs">Personal</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-xs">Parental</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
            <span className="text-xs">Other</span>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} className="text-center font-medium py-2 text-sm">
              {day}
            </div>
          ))}
          
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
      </CardContent>
    </Card>
  );
};

export default LeaveCalendarView;
