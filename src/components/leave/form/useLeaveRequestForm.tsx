
import { useState } from "react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAddLeaveRequest } from "@/hooks/use-leave-calendar";
import { useAuth } from "@/hooks/use-auth";
import { useEmployees } from "@/hooks/use-employees";
import { useProjectsForDepartment } from "@/hooks/use-projects";
import { calculateBusinessDays, checkProjectConflicts } from "@/utils/leave-utils";
import type { ProjectConflict } from "@/utils/leave-utils";

export const useLeaveRequestForm = () => {
  const [leaveType, setLeaveType] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [conflicts, setConflicts] = useState<ProjectConflict[]>([]);
  
  // Get the current authenticated user
  const { user } = useAuth();
  
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
  useState(() => {
    if (startDate && endDate && departmentProjects.length > 0) {
      const projectConflicts = checkProjectConflicts(startDate, endDate, departmentProjects);
      setConflicts(projectConflicts);
    } else {
      setConflicts([]);
    }
  });

  const { mutate: addLeave } = useAddLeaveRequest();
  const { toast } = useToast();
  
  const resetForm = () => {
    setLeaveType("");
    setStartDate(undefined);
    setEndDate(undefined);
    setNotes("");
    setIsSubmitting(false);
    setConflicts([]);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to submit leave requests.",
        variant: "destructive",
      });
      return;
    }
    
    if (!currentEmployee) {
      toast({
        title: "Employee record not found",
        description: "Your user account is not linked to an employee record.",
        variant: "destructive",
      });
      return;
    }
    
    if (!leaveType || !startDate || !endDate) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    if (endDate < startDate) {
      toast({
        title: "Invalid date range",
        description: "End date cannot be before start date.",
        variant: "destructive",
      });
      return;
    }
    
    const leaveDays = calculateBusinessDays(startDate, endDate);
    
    setIsSubmitting(true);
    
    const formattedStartDate = format(startDate, "yyyy-MM-dd");
    const formattedEndDate = format(endDate, "yyyy-MM-dd");
    
    const initialAuditLog = [{
      action: 'REQUEST_CREATED',
      timestamp: new Date().toISOString(),
      details: `Request created for ${leaveDays} business days`
    }];
    
    try {
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
          onSuccess: () => {
            toast({
              title: "Leave request submitted",
              description: "Your leave request has been submitted successfully.",
            });
            resetForm();
          },
          onError: (error: any) => {
            console.error("Error submitting leave request:", error);
            toast({
              title: "Error",
              description: `Failed to submit leave request: ${error.message || 'Please try again'}`,
              variant: "destructive",
            });
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
  };
};
