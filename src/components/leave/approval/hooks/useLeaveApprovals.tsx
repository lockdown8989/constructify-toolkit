
import { useState } from "react";
import { format, differenceInCalendarDays } from "date-fns";
import { useUpdateLeaveCalendar } from "@/hooks/use-leave-calendar";
import { useUpdateEmployee } from "@/hooks/use-employees";
import { useToast } from "@/hooks/use-toast";
import { notifyEmployeeOfLeaveStatusChange } from "@/services/notifications";
import type { LeaveCalendar } from "@/hooks/use-leave-calendar";
import type { Employee } from "@/hooks/use-employees";

interface CurrentUser {
  id: string;
  name: string;
  department: string;
  isManager: boolean;
}

export const useLeaveApprovals = (
  leaves: LeaveCalendar[],
  employees: Employee[],
  currentUser: CurrentUser
) => {
  const { mutate: updateLeave } = useUpdateLeaveCalendar();
  const { mutate: updateEmployee } = useUpdateEmployee();
  const { toast } = useToast();
  
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  
  // Get pending leave requests
  const pendingLeaves = leaves.filter(leave => leave.status === "Pending");
  
  // Filter leave requests based on selection criteria
  const filteredLeaves = pendingLeaves.filter(leave => {
    const employee = employees.find(emp => emp.id === leave.employee_id);
    
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
  
  // Helper function to calculate duration of leave
  const calculateLeaveDays = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return differenceInCalendarDays(end, start) + 1;
  };
  
  // Update employee status if leave is active
  const updateEmployeeStatus = (employeeId: string, startDate: string, endDate: string) => {
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (today >= start && today <= end) {
      updateEmployee(
        { id: employeeId, status: "Leave" },
        {
          onError: (error) => {
            console.error("Error updating employee status:", error);
            toast({
              title: "Error",
              description: "Failed to update employee status.",
              variant: "destructive",
            });
          },
        }
      );
    }
  };
  
  // Create audit log for leave actions
  const createAuditLog = (leave: LeaveCalendar, action: "Approved" | "Rejected"): string => {
    const currentDate = format(new Date(), "yyyy-MM-dd HH:mm:ss");
    const existingNotes = leave.notes || "";
    const auditEntry = `${action} by ${currentUser.name} on ${currentDate}`;
    
    return existingNotes
      ? `${existingNotes}\n\n${auditEntry}`
      : auditEntry;
  };
  
  // Handle leave approval
  const handleApprove = async (leave: LeaveCalendar) => {
    const auditLog = createAuditLog(leave, "Approved");
    
    updateLeave(
      { id: leave.id, status: "Approved", notes: auditLog },
      {
        onSuccess: async () => {
          updateEmployeeStatus(leave.employee_id, leave.start_date, leave.end_date);
          
          try {
            await notifyEmployeeOfLeaveStatusChange(leave, "Approved");
            console.log("Employee notification sent for approval");
          } catch (error) {
            console.error("Failed to send employee notification:", error);
          }
          
          toast({
            title: "Leave approved",
            description: "The leave request has been approved successfully.",
          });
        },
        onError: (error) => {
          console.error("Error approving leave:", error);
          toast({
            title: "Error",
            description: "Failed to approve the leave request. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };
  
  // Handle leave rejection
  const handleReject = async (leave: LeaveCalendar) => {
    const auditLog = createAuditLog(leave, "Rejected");
    
    updateLeave(
      { id: leave.id, status: "Rejected", notes: auditLog },
      {
        onSuccess: async () => {
          try {
            await notifyEmployeeOfLeaveStatusChange(leave, "Rejected");
            console.log("Employee notification sent for rejection");
          } catch (error) {
            console.error("Failed to send employee notification:", error);
          }
          
          toast({
            title: "Leave rejected",
            description: "The leave request has been rejected.",
          });
        },
        onError: (error) => {
          console.error("Error rejecting leave:", error);
          toast({
            title: "Error",
            description: "Failed to reject the leave request. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };
  
  // Helper functions for employee info
  const getEmployeeName = (employeeId: string): string => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.name : "Unknown Employee";
  };
  
  const getEmployeeDepartment = (employeeId: string): string => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.department : "Unknown";
  };
  
  return {
    filteredLeaves,
    selectedEmployee,
    setSelectedEmployee,
    selectedDepartment,
    setSelectedDepartment,
    selectedType,
    setSelectedType,
    handleApprove,
    handleReject,
    getEmployeeName,
    getEmployeeDepartment,
    calculateLeaveDays
  };
};
