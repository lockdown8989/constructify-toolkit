
import { useUpdateLeaveCalendar } from "@/hooks/use-leave-calendar";
import { useUpdateEmployee } from "@/hooks/use-employees";
import { useToast } from "@/hooks/use-toast";
import { createAuditLog } from "../utils/leave-utils";
import type { LeaveCalendar } from "@/hooks/leave/leave-types";
import { sendNotification } from "@/services/notifications/notification-sender";

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
  const handleApprove = async (leave: LeaveCalendar) => {
    const auditLog = createAuditLog(leave, "Approved", currentUser.name);
    
    updateLeave(
      { id: leave.id, status: "Approved", notes: auditLog },
      {
        onSuccess: async () => {
          updateEmployeeStatus(leave.employee_id, leave.start_date, leave.end_date);
          
          // Send notification to employee
          try {
            await sendNotification({
              user_id: leave.employee_id,
              title: "Leave request approved",
              message: `Your ${leave.type} leave request from ${leave.start_date} to ${leave.end_date} has been approved.`,
              type: "success",
              related_entity: "leave_calendar",
              related_id: leave.id
            });
          } catch (error) {
            console.error("Error sending notification:", error);
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
    const auditLog = createAuditLog(leave, "Rejected", currentUser.name);
    
    updateLeave(
      { id: leave.id, status: "Rejected", notes: auditLog },
      {
        onSuccess: async () => {
          // Send notification to employee
          try {
            await sendNotification({
              user_id: leave.employee_id,
              title: "Leave request rejected",
              message: `Your ${leave.type} leave request from ${leave.start_date} to ${leave.end_date} has been rejected.`,
              type: "warning",
              related_entity: "leave_calendar",
              related_id: leave.id
            });
          } catch (error) {
            console.error("Error sending notification:", error);
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

  return {
    handleApprove,
    handleReject
  };
};
