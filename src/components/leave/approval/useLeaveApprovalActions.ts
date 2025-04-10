
import { useUpdateLeaveCalendar } from "@/hooks/use-leave-calendar";
import { useUpdateEmployee } from "@/hooks/use-employees";
import { useToast } from "@/hooks/use-toast";
import { createAuditLog } from "../utils/leave-utils";
import type { LeaveCalendar } from "@/hooks/leave/leave-types";

// Hook to handle leave approval actions
export const useLeaveApprovalActions = (currentUser: any) => {
  const { mutate: updateLeave } = useUpdateLeaveCalendar();
  const { mutate: updateEmployee } = useUpdateEmployee();
  const { toast } = useToast();

  // Update employee status if they are currently on leave
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

  // Handle leave approval
  const handleApprove = (leave: LeaveCalendar) => {
    const auditLog = createAuditLog(leave, "Approved", currentUser.name);
    
    updateLeave(
      { id: leave.id, status: "Approved", notes: auditLog },
      {
        onSuccess: () => {
          updateEmployeeStatus(leave.employee_id, leave.start_date, leave.end_date);
          
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
  const handleReject = (leave: LeaveCalendar) => {
    const auditLog = createAuditLog(leave, "Rejected", currentUser.name);
    
    updateLeave(
      { id: leave.id, status: "Rejected", notes: auditLog },
      {
        onSuccess: () => {
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

  return {
    handleApprove,
    handleReject
  };
};
