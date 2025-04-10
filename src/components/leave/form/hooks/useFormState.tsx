
import { useState } from "react";

// Define the form status types
export type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

export type Conflict = {
  projectName: string;
  projectDeadline: string;
  conflictSeverity: 'Low' | 'Medium' | 'High';
  department: string;
};

export const useFormState = () => {
  // Form field state
  const [leaveType, setLeaveType] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [notes, setNotes] = useState<string>("");
  
  // Form status state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formStatus, setFormStatus] = useState<FormStatus>('idle');
  
  // Project conflicts state
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  
  // Reset form fields
  const resetForm = () => {
    setLeaveType("");
    setStartDate(undefined);
    setEndDate(undefined);
    setNotes("");
    setIsSubmitting(false);
    setFormStatus('idle');
    setConflicts([]);
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
    
    // Form status
    isSubmitting,
    setIsSubmitting,
    formStatus,
    setFormStatus,
    
    // Conflicts
    conflicts,
    setConflicts,
    
    // Actions
    resetForm,
  };
};
