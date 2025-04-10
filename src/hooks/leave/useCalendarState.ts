
import { useState, useEffect } from "react";
import { addMonths, subMonths, isSameDay } from "date-fns";
import type { DateRange } from "react-day-picker";
import { useLeaveCalendar } from "@/hooks/use-leave-calendar";
import { useEmployees } from "@/hooks/use-employees";
import { useQueryClient } from "@tanstack/react-query";

export function useCalendarState() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeView, setActiveView] = useState<"calendar" | "list">("calendar");
  
  const { data: leaves = [], isLoading: isLoadingLeaves, refetch } = useLeaveCalendar();
  const { data: employees = [], isLoading: isLoadingEmployees } = useEmployees();
  const queryClient = useQueryClient();
  
  // Set up auto-refresh for leave calendar data
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [refetch]);
  
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
  
  // Manual refresh function
  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ['leave-calendar'] });
  };
  
  return {
    currentDate,
    activeView,
    dateRange,
    searchTerm,
    leaves,
    filteredLeaves,
    employees,
    isLoading: isLoadingLeaves || isLoadingEmployees,
    handlePrevMonth,
    handleNextMonth,
    setDateRange,
    setSearchTerm,
    setActiveView,
    getEmployeeName,
    refreshData
  };
}
