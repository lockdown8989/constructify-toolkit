
import React, { useState } from "react";
import { addMonths, subMonths, isSameDay, isWithinInterval } from "date-fns";
import { useLeaveCalendar } from "@/hooks/use-leave-calendar";
import { useEmployees } from "@/hooks/use-employees";
import type { DateRange } from "react-day-picker";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";

// Import our new components
import CalendarHeader from "./calendar/CalendarHeader";
import CalendarFilters from "./calendar/CalendarFilters";
import CalendarLegend from "./calendar/CalendarLegend";
import CalendarGrid from "./calendar/CalendarGrid";
import LeaveListView from "./calendar/LeaveListView";

const EnhancedCalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeView, setActiveView] = useState<"calendar" | "list">("calendar");
  
  const { data: leaves = [], isLoading: isLoadingLeaves } = useLeaveCalendar();
  const { data: employees = [], isLoading: isLoadingEmployees } = useEmployees();
  
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
  
  if (isLoadingLeaves || isLoadingEmployees) {
    return <div className="flex justify-center p-6">Loading...</div>;
  }
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CalendarHeader 
          currentDate={currentDate}
          activeView={activeView}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onViewChange={(view) => setActiveView(view)}
        />
        <CardDescription>
          Color-coded employee leave calendar
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <CalendarFilters 
          dateRange={dateRange}
          searchTerm={searchTerm}
          onDateRangeChange={setDateRange}
          onSearchTermChange={setSearchTerm}
        />
        
        {/* Calendar Legend */}
        <CalendarLegend />
        
        <TabsContent value="calendar" className="mt-2">
          <CalendarGrid 
            currentDate={currentDate}
            leaves={leaves}
            getEmployeeName={getEmployeeName}
          />
        </TabsContent>
        
        <TabsContent value="list" className="mt-2">
          <LeaveListView 
            leaves={filteredLeaves}
            getEmployeeName={getEmployeeName}
          />
        </TabsContent>
      </CardContent>
    </Card>
  );
};

export default EnhancedCalendarView;
