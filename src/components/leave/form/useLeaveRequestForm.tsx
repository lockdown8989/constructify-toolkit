
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAddLeaveRequest } from "@/hooks/use-leave-calendar";
import { useAuth } from "@/hooks/use-auth";
import { useEmployees } from "@/hooks/use-employees";
import { useProjectsForDepartment } from "@/hooks/use-projects";
import { calculateBusinessDays, checkProjectConflicts } from "@/utils/leave-utils";
import type { ProjectConflict } from "@/utils/leave-utils";
import { useQueryClient } from "@tanstack/react-query";
import { createLeaveRequestNotification } from "@/services/NotificationService";

// Define form status type
type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

export const useLeaveRequestForm = () => {
  const [leaveType, setLeaveType] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [conflicts, setConflicts] = useState<ProjectConflict[]>([]);
  const [formStatus, setFormStatus] = useState<FormStatus>('idle');
  
  // Get the current authenticated user
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Get employees data to find the current employee record
  const { data: employees = [], isLoading: isLoadingEmployees } = useEmployees();
  
  // Get current employee ID and department from employees list based on user ID
  const currentEmployee = user 
    ? employees.find(emp => emp.user_id === user.id) 
    : undefined;
  
  const employeeId = currentEmployee?.id || "";
  const employeeDepartment = currentEmployee?.department || "";
  
  // Get projects for the employee's department
  const { data: departmentProjects = [] } = useProjectsForDepartment(employeeDepartment);
  
  // Update conflicts when dates or projects change
  useEffect(() => {
    if (startDate && endDate && departmentProjects.length > 0) {
      const projectConflicts = checkProjectConflicts(startDate, endDate, departmentProjects);
      setConflicts(projectConflicts);
    } else {
      setConflicts([]);
    }
  }, [startDate, endDate, departmentProjects]);

  const { mutate: addLeave } = useAddLeaveRequest();
  const { toast } = useToast();
  
  const resetForm = () => {
    setLeaveType("");
    setStartDate(undefined);
    setEndDate(undefined);
    setNotes("");
    setIsSubmitting(false);
    setConflicts([]);
    setFormStatus('idle');
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to submit leave requests.",
        variant: "destructive",
      });
      setFormStatus('error');
      return;
    }
    
    if (!currentEmployee) {
      toast({
        title: "Employee record not found",
        description: "Your user account is not linked to an employee record.",
        variant: "destructive",
      });
      setFormStatus('error');
      return;
    }
    
    if (!leaveType || !startDate || !endDate) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      setFormStatus('error');
      return;
    }
    
    if (endDate < startDate) {
      toast({
        title: "Invalid date range",
        description: "End date cannot be before start date.",
        variant: "destructive",
      });
      setFormStatus('error');
      return;
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
      console.log('Current user ID:', user.id);
      console.log('Current employee record:', currentEmployee);
      
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
            // Create notification for the leave request
            if (data && data.id) {
              try {
                await createLeaveRequestNotification(
                  user.id,
                  data.id,
                  format(startDate, "MMM d, yyyy"),
                  format(endDate, "MMM d, yyyy"),
                  leaveType
                );
              } catch (error) {
                console.error("Error creating leave request notification:", error);
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
          },
        }
      );
    } catch (error: any) {
      console.error("Exception in submission:", error);
      toast({
        title: "Error",
        description: `Failed to submit leave request: ${error.message || 'Please try again'}`,
        variant: "destructive",
      });
      setFormStatus('error');
      setIsSubmitting(false);
    }
  };

  return {
    leaveType,
    setLeaveType,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    notes,
    setNotes,
    isSubmitting,
    conflicts,
    currentEmployee,
    isLoadingEmployees,
    handleSubmit,
    formStatus,
  };
};
