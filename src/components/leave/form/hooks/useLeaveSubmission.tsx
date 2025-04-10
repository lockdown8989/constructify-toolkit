
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAddLeaveRequest } from "@/hooks/use-leave-calendar";
import { useQueryClient } from "@tanstack/react-query";
import { calculateBusinessDays } from "@/utils/leave-utils";
import { supabase } from '@/integrations/supabase/client';
import { 
  createTestNotification,
  sendNotification 
} from "@/services/notifications";
import { getManagerUserIds } from "@/services/notifications/role-utils";
import type { FormStatus } from "./useFormState";

/**
 * Notifies managers about a new leave request
 */
export const notifyManagersOfNewLeaveRequest = async (leaveRequest: any) => {
  try {
    // Get employee details
    const { data: employeeData } = await supabase
      .from('employees')
      .select('name')
      .eq('id', leaveRequest.employee_id)
      .single();
    
    const employeeName = employeeData?.name || 'An employee';
    
    // Get all manager user IDs
    const managerIds = await getManagerUserIds();
    console.log(`Notifying ${managerIds.length} managers about new leave request`);
    
    if (managerIds.length === 0) {
      console.warn('No managers found to notify about leave request');
      return;
    }
    
    // Send notification to each manager
    for (const managerId of managerIds) {
      await sendNotification({
        user_id: managerId,
        title: "New Leave Request",
        message: `${employeeName} has submitted a new leave request from ${format(new Date(leaveRequest.start_date), "MMM d, yyyy")} to ${format(new Date(leaveRequest.end_date), "MMM d, yyyy")}`,
        type: "info",
        related_entity: "leave_calendar",
        related_id: leaveRequest.id
      });
    }
    
    console.log('Successfully notified all managers about new leave request');
  } catch (error) {
    console.error('Error notifying managers about leave request:', error);
    // Continue execution even if notification fails
  }
};

/**
 * Hook to handle leave request submission
 */
export const useLeaveSubmission = (
  setIsSubmitting: (value: boolean) => void,
  setFormStatus: (status: FormStatus) => void
) => {
  const { toast } = useToast();
  const { mutate: addLeave } = useAddLeaveRequest();
  const queryClient = useQueryClient();
  
  const submitLeaveRequest = async (
    userId: string,
    employeeId: string,
    employeeName: string,
    leaveType: string,
    startDate: Date,
    endDate: Date,
    notes: string
  ) => {
    if (!startDate || !endDate || !leaveType) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      setFormStatus('error');
      return false;
    }
    
    if (endDate < startDate) {
      toast({
        title: "Invalid date range",
        description: "End date cannot be before start date.",
        variant: "destructive",
      });
      setFormStatus('error');
      return false;
    }
    
    const leaveDays = calculateBusinessDays(startDate, endDate);
    setIsSubmitting(true);
    setFormStatus('submitting');
    
    const formattedStartDate = format(startDate, "yyyy-MM-dd");
    const formattedEndDate = format(endDate, "yyyy-MM-dd");
    
    const initialAuditLog = [{
      action: 'REQUEST_CREATED',
      timestamp: new Date().toISOString(),
      details: `Request created for ${leaveDays} business days`
    }];
    
    try {
      console.log('Submitting leave request with employee ID:', employeeId);
      console.log('Current user ID:', userId);
      
      await addLeave(
        {
          employee_id: employeeId,
          type: leaveType,
          start_date: formattedStartDate,
          end_date: formattedEndDate,
          notes: notes || null,
          audit_log: initialAuditLog,
          status: 'Pending'
        },
        {
          onSuccess: async (data) => {
            console.log('Leave request submitted successfully:', data);
            
            // Create notification for the employee
            if (data && data.id) {
              try {
                // Notify the employee who submitted the request
                await createTestNotification(
                  userId,
                  `Leave Request Submitted: ${leaveType}`,
                  `Your leave request from ${format(startDate, "MMM d, yyyy")} to ${format(endDate, "MMM d, yyyy")} has been submitted and is pending approval.`,
                  'info',
                  'leave_calendar',
                  data.id
                );
                
                // Notify managers about the new request
                await notifyManagersOfNewLeaveRequest(data);
              } catch (error) {
                console.error("Error sending notifications:", error);
                // Continue with success even if notification fails
              }
            }
            
            // Show toast notification
            toast({
              title: "Leave request submitted",
              description: "Your leave request has been submitted successfully and is pending approval.",
            });
            
            // Invalidate queries to refresh the calendar data
            queryClient.invalidateQueries({ queryKey: ['leave-calendar'] });
            
            // Update form status to success
            setFormStatus('success');
            setIsSubmitting(false);
            
            return true;
          },
          onError: (error: any) => {
            console.error("Error submitting leave request:", error);
            toast({
              title: "Error",
              description: `Failed to submit leave request: ${error.message || 'Please try again'}`,
              variant: "destructive",
            });
            setFormStatus('error');
            setIsSubmitting(false);
            
            return false;
          },
        }
      );
      
      return true;
    } catch (error: any) {
      console.error("Exception in submission:", error);
      toast({
        title: "Error",
        description: `Failed to submit leave request: ${error.message || 'Please try again'}`,
        variant: "destructive",
      });
      setFormStatus('error');
      setIsSubmitting(false);
      
      return false;
    }
  };
  
  return { submitLeaveRequest };
};
