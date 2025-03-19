
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { useAddLeaveCalendar } from "@/hooks/leave-calendar/use-leave-mutations";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useProjectsForDepartment } from "@/hooks/use-projects";
import { checkProjectConflicts, calculateBusinessDays } from "@/utils/leave-utils";
import ProjectConflicts from "./ProjectConflicts";
import type { ProjectConflict } from "@/utils/leave-utils";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";

import DatePickerField from "./form/DatePickerField";
import LeaveTypeSelector from "./form/LeaveTypeSelector";
import NotesField from "./form/NotesField";

interface LeaveRequestFormProps {
  employeeId: string;
  employeeDepartment: string;
}

const LeaveRequestForm: React.FC<LeaveRequestFormProps> = ({ 
  employeeId,
  employeeDepartment 
}) => {
  const [leaveType, setLeaveType] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [conflicts, setConflicts] = useState<ProjectConflict[]>([]);
  const { data: departmentProjects = [] } = useProjectsForDepartment(employeeDepartment);
  
  useEffect(() => {
    if (startDate && endDate && departmentProjects.length > 0) {
      const projectConflicts = checkProjectConflicts(startDate, endDate, departmentProjects);
      setConflicts(projectConflicts);
    }
  }, [startDate, endDate, departmentProjects]);

  const { mutate: addLeave } = useAddLeaveCalendar();
  const { toast } = useToast();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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
    
    addLeave(
      {
        employee_id: employeeId,
        type: leaveType,
        start_date: formattedStartDate,
        end_date: formattedEndDate,
        notes: notes || null,
        audit_log: initialAuditLog
      },
      {
        onSuccess: () => {
          toast({
            title: "Leave request submitted",
            description: "Your leave request has been submitted successfully.",
          });
          
          setLeaveType("");
          setStartDate(undefined);
          setEndDate(undefined);
          setNotes("");
          setIsSubmitting(false);
        },
        onError: (error) => {
          console.error("Error submitting leave request:", error);
          toast({
            title: "Error",
            description: "Failed to submit leave request. Please try again.",
            variant: "destructive",
          });
          setIsSubmitting(false);
        },
      }
    );
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Leave</CardTitle>
        <CardDescription>
          Submit a new leave request for approval
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <LeaveTypeSelector 
            value={leaveType}
            onChange={setLeaveType}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <DatePickerField
              id="startDate"
              label="Start Date"
              date={startDate}
              onSelect={setStartDate}
            />
            
            <DatePickerField
              id="endDate"
              label="End Date"
              date={endDate}
              onSelect={setEndDate}
            />
          </div>
          
          <NotesField
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          
          {conflicts.length > 0 && (
            <div className="space-y-2">
              <ProjectConflicts conflicts={conflicts} />
            </div>
          )}
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting || conflicts.some(c => c.conflictSeverity === 'High')}
          >
            {isSubmitting ? "Submitting..." : 
             conflicts.some(c => c.conflictSeverity === 'High') ? 
             "High Priority Conflict Detected" : 
             "Submit Request"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default LeaveRequestForm;
