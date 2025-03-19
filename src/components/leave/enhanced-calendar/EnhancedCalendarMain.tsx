
import React, { useState } from "react";
import { addMonths, subMonths, isSameDay, format } from "date-fns";
import { useLeaveCalendar } from "@/hooks/leave-calendar";
import { useEmployees } from "@/hooks/use-employees";
import type { DateRange } from "react-day-picker";

// Import our components
import CalendarHeader from "../calendar/CalendarHeader";
import CalendarFilters from "../calendar/CalendarFilters";
import CalendarLegend from "../calendar/CalendarLegend";
import CalendarGrid from "../calendar/CalendarGrid";
import LeaveListView from "../calendar/LeaveListView";
import { getTypeColor, getStatusColor } from "../calendar/utils";

const EnhancedCalendarMain: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeView, setActiveView] = useState<"calendar" | "list">("calendar");
  
  // Calculate the first and last day of the current month
  const firstDayOfMonth = format(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1), 'yyyy-MM-dd');
  const lastDayOfMonth = format(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0), 'yyyy-MM-dd');
  
  const { data: leaves = [], isLoading: isLoadingLeaves } = useLeaveCalendar(firstDayOfMonth, lastDayOfMonth);
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
    <>
      <CalendarHeader 
        currentDate={currentDate}
        activeView={activeView}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onViewChange={setActiveView}
      />
      
      <CalendarFilters 
        dateRange={dateRange}
        searchTerm={searchTerm}
        onDateRangeChange={setDateRange}
        onSearchTermChange={setSearchTerm}
      />
      
      {/* Calendar Legend */}
      <CalendarLegend />
      
      {activeView === "calendar" ? (
        <div className="mt-4">
          <CalendarGrid 
            currentDate={currentDate}
            leaves={leaves}
            getEmployeeName={getEmployeeName}
            getTypeColor={getTypeColor}
            getStatusColor={getStatusColor}
          />
        </div>
      ) : (
        <div className="mt-4">
          <LeaveListView 
            leaves={filteredLeaves}
            getEmployeeName={getEmployeeName}
          />
        </div>
      )}
    </>
  );
};

export default EnhancedCalendarMain;
