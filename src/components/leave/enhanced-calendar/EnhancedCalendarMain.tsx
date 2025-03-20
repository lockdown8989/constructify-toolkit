
import React, { useState, useEffect } from "react";
import { addMonths, subMonths, isSameDay, format } from "date-fns";
import { useLeaveCalendar } from "@/hooks/leave-calendar";
import { useEmployees } from "@/hooks/use-employees";
import type { DateRange } from "react-day-picker";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

// Import our components
import CalendarHeader from "../calendar/CalendarHeader";
import CalendarFilters from "../calendar/CalendarFilters";
import CalendarLegend from "../calendar/CalendarLegend";
import CalendarGrid from "../calendar/CalendarGrid";
import LeaveListView from "../calendar/LeaveListView";
import { getTypeColor, getStatusColor } from "../calendar/utils";

const EnhancedCalendarMain: React.FC = () => {
  const { toast } = useToast();
  const { user, isLoading: isLoadingAuth } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeView, setActiveView] = useState<"calendar" | "list">("calendar");
  
  // Calculate the first and last day of the current month
  const firstDayOfMonth = format(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1), 'yyyy-MM-dd');
  const lastDayOfMonth = format(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0), 'yyyy-MM-dd');
  
  const { data: leaves = [], isLoading: isLoadingLeaves, error: leavesError } = useLeaveCalendar(firstDayOfMonth, lastDayOfMonth);
  const { data: employees = [], isLoading: isLoadingEmployees, error: employeesError } = useEmployees();
  
  // Check for errors and show toast notifications
  useEffect(() => {
    if (leavesError) {
      console.error("Error loading leave data:", leavesError);
      toast({
        title: "Error loading leave data",
        description: "Please try again or contact support if the issue persists.",
        variant: "destructive",
      });
    }
    
    if (employeesError) {
      console.error("Error loading employee data:", employeesError);
      toast({
        title: "Error loading employee data",
        description: "Please try again or contact support if the issue persists.",
        variant: "destructive",
      });
    }
  }, [leavesError, employeesError, toast]);
  
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
  
  // Check if data is loading
  const isLoading = isLoadingLeaves || isLoadingEmployees || isLoadingAuth;
  
  if (isLoading) {
    return <div className="flex justify-center items-center p-12 min-h-[300px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }
  
  // Check if we have actual data
  if (leaves.length === 0 && !isLoading) {
    return <div className="flex flex-col items-center justify-center p-12 min-h-[300px] text-center">
      <h3 className="text-xl font-semibold mb-2">No leave data available</h3>
      <p className="text-muted-foreground">There are no leave requests for the selected period.</p>
    </div>;
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
