
import { useState } from "react";
import type { LeaveCalendar } from "@/hooks/leave/leave-types";
import type { Employee } from "@/hooks/use-employees";

// Hook to handle filtering of leave requests
export const useLeaveFiltering = (
  pendingLeaves: LeaveCalendar[],
  employees: Employee[],
  currentUser: any
) => {
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  
  // Extract unique departments from employees
  const departments = [...new Set(employees.map(emp => emp.department))];
  
  // Extract unique leave types from leaves
  const leaveTypes = [...new Set(pendingLeaves.map(leave => leave.type))];
  
  // Filter leaves based on selected criteria
  const filteredLeaves = pendingLeaves.filter(leave => {
    const employee = employees.find(emp => emp.id === leave.employee_id);
    
    // If user is a department manager (not HR), only show leaves from their department
    if (currentUser.isManager && !currentUser.department?.includes("HR")) {
      if (employee && employee.department !== currentUser.department) {
        return false;
      }
    }
    
    const matchesEmployee = selectedEmployee === "all" || leave.employee_id === selectedEmployee;
    const matchesDepartment = selectedDepartment === "all" || (employee && employee.department === selectedDepartment);
    const matchesType = selectedType === "all" || leave.type === selectedType;
    
    return matchesEmployee && matchesDepartment && matchesType;
  });
  
  // Helper functions to get employee info
  const getEmployeeName = (employeeId: string): string => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.name : "Unknown Employee";
  };
  
  const getEmployeeDepartment = (employeeId: string): string => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.department : "Unknown";
  };
  
  return {
    selectedEmployee,
    selectedDepartment,
    selectedType,
    setSelectedEmployee,
    setSelectedDepartment,
    setSelectedType,
    departments,
    leaveTypes,
    filteredLeaves,
    getEmployeeName,
    getEmployeeDepartment
  };
};
