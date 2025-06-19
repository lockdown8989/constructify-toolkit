import { useUpdateLeaveCalendar } from "@/hooks/use-leave-calendar";
import { useUpdateEmployee } from "@/hooks/use-employees";
import { useToast } from "@/hooks/use-toast";
import { createAuditLog } from "../utils/leave-utils";
import type { LeaveCalendar, AuditLogEntry } from "@/hooks/leave/leave-types";
import { sendNotification } from "@/services/notifications/notification-sender";
import { useAuth } from "@/hooks/use-auth";

// Hook to handle leave approval actions
export const useLeaveApprovalActions = (currentUser: any) => {
  const { mutate: updateLeave } = useUpdateLeaveCalendar();
  const { mutate: updateEmployee } = useUpdateEmployee();
  const { toast } = useToast();
  const { user } = useAuth();

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
    // Get current user's full name from auth context
    const managerName = currentUser?.name || 'System';
    
    const auditLog = createAuditLog(leave, "Approved", managerName);
    
    updateLeave(
      { id: leave.id, status: "Approved", audit_log: auditLog },
      {
        onSuccess: async () => {
          updateEmployeeStatus(leave.employee_id, leave.start_date, leave.end_date);
          
          // Send notification to employee
          try {
            await sendNotification({
              user_id: leave.employee_id,
              title: "Leave request approved",
              message: `Your ${leave.type} leave request from ${new Date(leave.start_date).toLocaleDateString('en-GB', {day: '2-digit', month: '2-digit', year: 'numeric'}).replace(/\//g, '.')} to ${new Date(leave.end_date).toLocaleDateString('en-GB', {day: '2-digit', month: '2-digit', year: 'numeric'}).replace(/\//g, '.')} has been approved by ${managerName}.`,
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
    // Get current user's full name from auth context
    const managerName = currentUser?.name || 'System';
    
    const auditLog = createAuditLog(leave, "Rejected", managerName);
    
    updateLeave(
      { id: leave.id, status: "Rejected", audit_log: auditLog },
      {
        onSuccess: async () => {
          // Send notification to employee
          try {
            await sendNotification({
              user_id: leave.employee_id,
              title: "Leave request rejected",
              message: `Your ${leave.type} leave request from ${new Date(leave.start_date).toLocaleDateString('en-GB', {day: '2-digit', month: '2-digit', year: 'numeric'}).replace(/\//g, '.')} to ${new Date(leave.end_date).toLocaleDateString('en-GB', {day: '2-digit', month: '2-digit', year: 'numeric'}).replace(/\//g, '.')} has been rejected by ${managerName}.`,
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
