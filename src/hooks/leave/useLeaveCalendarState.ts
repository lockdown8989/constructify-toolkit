
import { useState } from "react";
import { addMonths, subMonths } from "date-fns";
import { useLeaveCalendar } from "@/hooks/leave/use-leave-requests";
import { useEmployees } from "@/hooks/use-employees";
import { useSchedules } from "@/hooks/use-schedules";
import { useOpenShifts } from "@/hooks/use-open-shifts";

export function useLeaveCalendarState() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { data: leaves = [], isLoading: isLoadingLeaves } = useLeaveCalendar();
  const { data: employees = [], isLoading: isLoadingEmployees } = useEmployees();
  const { data: schedules = [], isLoading: isLoadingSchedules } = useSchedules();
  const { openShifts = [], isLoading: isLoadingOpenShifts } = useOpenShifts();
  
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
    schedules,
    openShifts,
    employees,
    isLoading: isLoadingLeaves || isLoadingEmployees || isLoadingSchedules || isLoadingOpenShifts,
    handlePrevMonth,
    handleNextMonth,
    getEmployeeName
  };
}
