
import { format } from "date-fns";
import { differenceInCalendarDays } from "date-fns";
import type { LeaveCalendar } from "@/hooks/leave-calendar";
import type { Employee } from "@/hooks/use-employees";

export const calculateLeaveDays = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return differenceInCalendarDays(end, start) + 1; // Include both start and end dates
};

export const createAuditLog = (
  leave: LeaveCalendar, 
  action: "Approved" | "Rejected", 
  userName: string
): string => {
  const currentDate = format(new Date(), "yyyy-MM-dd HH:mm:ss");
  const existingNotes = leave.notes || "";
  const auditEntry = `${action} by ${userName} on ${currentDate}`;
  
  return existingNotes
    ? `${existingNotes}\n\n${auditEntry}`
    : auditEntry;
};

export const filterLeaves = (
  leaves: LeaveCalendar[],
  employees: Employee[],
  currentUser: { id: string; department: string; isManager: boolean },
  selectedEmployee: string,
  selectedDepartment: string,
  selectedType: string
): LeaveCalendar[] => {
  return leaves.filter(leave => {
    const employee = employees.find(emp => emp.id === leave.employee_id);
    
    // Security check: Only allow managers to see their department's leaves
    if (currentUser.isManager && !currentUser.department.includes("HR")) {
      if (employee && employee.department !== currentUser.department) {
        return false;
      }
    }
    
    const matchesEmployee = selectedEmployee === "all" || leave.employee_id === selectedEmployee;
    const matchesDepartment = selectedDepartment === "all" || (employee && employee.department === selectedDepartment);
    const matchesType = selectedType === "all" || leave.type === selectedType;
    
    return matchesEmployee && matchesDepartment && matchesType;
  });
};
