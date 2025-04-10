
import React from "react";
import { useToast } from "@/hooks/use-toast";
import { useFormState } from "./hooks/useFormState";
import { useEmployeeData } from "./hooks/useEmployeeData";
import { useProjectConflicts } from "./hooks/useProjectConflicts";
import { useLeaveSubmission } from "./hooks/useLeaveSubmission";

export const useLeaveRequestForm = () => {
  const {
    leaveType,
    setLeaveType,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    notes,
    setNotes,
    isSubmitting,
    setIsSubmitting,
    conflicts,
    setConflicts,
    formStatus,
    setFormStatus,
  } = useFormState();
  
  const {
    user,
    currentEmployee,
    employeeId,
    departmentProjects,
    isLoadingEmployees
  } = useEmployeeData();
  
  // Hook for checking project conflicts
  useProjectConflicts(startDate, endDate, departmentProjects, setConflicts);
  
  // Hook for handling form submission
  const { submitLeaveRequest } = useLeaveSubmission(setIsSubmitting, setFormStatus);
  
  const { toast } = useToast();
  
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
    
    // Submit the leave request
    await submitLeaveRequest(
      user.id,
      employeeId,
      currentEmployee.name,
      leaveType,
      startDate as Date,
      endDate as Date,
      notes
    );
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
