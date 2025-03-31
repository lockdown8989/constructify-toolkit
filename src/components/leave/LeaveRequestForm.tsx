import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useAddLeaveCalendar } from "@/hooks/use-leave-calendar";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaveRequestFormProps {
  employeeId: string;
  employeeDepartment: string;
}

const LeaveRequestForm: React.FC<LeaveRequestFormProps> = ({ 
  employeeId,
  employeeDepartment 
}) => {
  const [leaveType, setLeaveType] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [conflicts, setConflicts] = useState<ProjectConflict[]>([]);
  const { data: departmentProjects = [] } = useProjectsForDepartment(employeeDepartment);
  
  useEffect(() => {
    if (startDate && endDate && departmentProjects.length > 0) {
      const projectConflicts = checkProjectConflicts(startDate, endDate, departmentProjects);
      setConflicts(projectConflicts);
    } else {
      setConflicts([]);
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
          setConflicts([]);
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
          <div className="space-y-2">
            <Label htmlFor="leaveType">Leave Type</Label>
            <Select
              value={leaveType}
              onValueChange={setLeaveType}
            >
              <SelectTrigger id="leaveType">
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Holiday">Holiday</SelectItem>
                <SelectItem value="Sickness">Sickness</SelectItem>
                <SelectItem value="Personal">Personal</SelectItem>
                <SelectItem value="Parental">Parental</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="startDate"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="endDate"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional information about your leave request"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>
          
          {conflicts.length > 0 && (
            <div className="space-y-2">
              <Label>Potential Conflicts</Label>
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
