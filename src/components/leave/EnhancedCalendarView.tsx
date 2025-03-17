
import React, { useState } from "react";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval,
  isSameMonth,
  isToday,
  getDay,
  isSameDay,
  parseISO,
  isWithinInterval 
} from "date-fns";
import { CalendarRange, ChevronLeft, ChevronRight, Info, Search } from "lucide-react";
import { useLeaveCalendar } from "@/hooks/use-leave-calendar";
import { useEmployees } from "@/hooks/use-employees";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
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
import { Input } from "@/components/ui/input";
import type { LeaveCalendar } from "@/hooks/use-leave-calendar";
import type { DateRange } from "react-day-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const EnhancedCalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeView, setActiveView] = useState<"calendar" | "list">("calendar");
  
  const { data: leaves = [], isLoading: isLoadingLeaves } = useLeaveCalendar();
  const { data: employees = [], isLoading: isLoadingEmployees } = useEmployees();
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Find the day of the week the month starts on (0 = Sunday, 1 = Monday, etc.)
  const startDay = getDay(monthStart);
  
  // Create a 7x6 grid for the calendar (7 days of the week, up to 6 weeks per month)
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
  
  // Filter leaves based on date range and search term
  const filteredLeaves = leaves.filter(leave => {
    const startDate = new Date(leave.start_date);
    const endDate = new Date(leave.end_date);
    const employeeName = getEmployeeName(leave.employee_id).toLowerCase();
    
    const matchesSearch = searchTerm === "" || 
      employeeName.includes(searchTerm.toLowerCase()) ||
      leave.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDateRange = !dateRange || !dateRange.from || 
      (dateRange.to ? 
        (startDate <= dateRange.to && endDate >= dateRange.from) : 
        isSameDay(startDate, dateRange.from) || isSameDay(endDate, dateRange.from));
    
    return matchesSearch && matchesDateRange;
  });
  
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
          <Tabs value={activeView} onValueChange={(value) => setActiveView(value as "calendar" | "list")} className="ml-auto mr-4">
            <TabsList>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
              <TabsTrigger value="list">List</TabsTrigger>
            </TabsList>
          </Tabs>
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
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="w-full md:w-1/2">
            <DateRangePicker 
              dateRange={dateRange} 
              onDateRangeChange={setDateRange} 
              className="w-full"
            />
          </div>
          <div className="w-full md:w-1/2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by employee or leave type"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>
        
        {/* Calendar Legend */}
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
        
        <TabsContent value="calendar" className="mt-2">
          {/* Calendar Grid */}
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
        </TabsContent>
        
        <TabsContent value="list" className="mt-2">
          <div className="divide-y">
            {filteredLeaves.length === 0 ? (
              <div className="py-4 text-center text-muted-foreground">
                No leave requests found
              </div>
            ) : (
              filteredLeaves.map(leave => (
                <div key={leave.id} className="py-3 flex items-center">
                  <div className={`w-3 h-3 rounded-full ${getTypeColor(leave.type)} mr-3`}></div>
                  <div className="flex-1">
                    <div className="font-medium">{getEmployeeName(leave.employee_id)}</div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(leave.start_date), "PPP")} - {format(new Date(leave.end_date), "PPP")}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm">{leave.type}</div>
                    <div className={`px-2 py-1 rounded text-xs text-white ${getStatusColor(leave.status)}`}>
                      {leave.status}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </CardContent>
    </Card>
  );
};

export default EnhancedCalendarView;
