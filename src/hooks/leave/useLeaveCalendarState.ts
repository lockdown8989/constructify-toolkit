
import { useState } from "react";
import { addMonths, subMonths } from "date-fns";
import { useLeaveCalendar } from "@/hooks/use-leave-calendar";
import { useEmployees } from "@/hooks/use-employees";

export function useLeaveCalendarState() {
  const [currentDate, setCurrentDate] = useState(new Date());
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
  
  return {
    currentDate,
    leaves,
    employees,
    isLoading: isLoadingLeaves || isLoadingEmployees,
    handlePrevMonth,
    handleNextMonth,
    getEmployeeName
  };
}
