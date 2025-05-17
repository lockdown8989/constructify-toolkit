
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAddLeaveRequest } from "@/hooks/leave";
import { useQueryClient } from "@tanstack/react-query";
import { calculateBusinessDays } from "@/utils/leave-utils";
import type { FormStatus } from "./useFormState";
import { AuditLogEntry } from "@/hooks/leave/leave-types";

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
    
    const initialAuditLog: AuditLogEntry[] = [{
      action: 'REQUEST_CREATED',
      timestamp: new Date().toISOString(),
      status: 'Pending',
      reviewer_name: employeeName,
      employee_name: employeeName
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
