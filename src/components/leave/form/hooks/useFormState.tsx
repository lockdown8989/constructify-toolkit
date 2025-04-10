
import { useState } from "react";
import type { ProjectConflict } from "@/utils/leave-utils";

// Define form status type
export type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

/**
 * Hook to manage form state for leave requests
 */
export const useFormState = () => {
  const [leaveType, setLeaveType] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [conflicts, setConflicts] = useState<ProjectConflict[]>([]);
  const [formStatus, setFormStatus] = useState<FormStatus>('idle');
  
  const resetForm = () => {
    setLeaveType("");
    setStartDate(undefined);
    setEndDate(undefined);
    setNotes("");
    setIsSubmitting(false);
    setConflicts([]);
    setFormStatus('idle');
  };

  return {
    // Form fields
    leaveType,
    setLeaveType,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    notes,
    setNotes,
    
    // Form state
    isSubmitting,
    setIsSubmitting,
    conflicts,
    setConflicts,
    formStatus,
    setFormStatus,
    
    // Form actions
    resetForm,
  };
};
