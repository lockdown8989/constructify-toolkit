
import React from "react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle } from "lucide-react";
import LeaveTypeSelector from "./form/LeaveTypeSelector";
import DateSelector from "./form/DateSelector";
import NotesField from "./form/NotesField";
import ProjectConflicts from "./ProjectConflicts";
import { useLeaveRequestForm } from "./form/useLeaveRequestForm";
import { useQueryClient } from "@tanstack/react-query";

interface LeaveRequestFormProps {
  // Optional props still allowed, but we'll handle auth inside the component
}

const LeaveRequestForm: React.FC<LeaveRequestFormProps> = () => {
  const queryClient = useQueryClient();
  
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
    conflicts,
    currentEmployee,
    isLoadingEmployees,
    handleSubmit,
    formStatus,
  } = useLeaveRequestForm();
  
  // Display loading state while employee data is being fetched
  if (isLoadingEmployees) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center">
            <p>Loading employee data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Show message if no employee record found
  if (!currentEmployee) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center p-4">
            <p className="text-destructive font-medium mb-2">Employee Record Not Found</p>
            <p className="text-muted-foreground">Your user account is not linked to an employee record.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Handle form submission with query invalidation
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(e);
    
    // Invalidate queries to refresh the calendar
    queryClient.invalidateQueries({ queryKey: ['leave-calendar'] });
  };
  
  // If the form was submitted successfully, show the success message
  if (formStatus === 'success') {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center p-6 space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h3 className="text-xl font-medium">Leave Request Submitted</h3>
            <p className="text-muted-foreground">
              Your leave request has been submitted successfully and is pending approval.
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
            >
              Submit Another Request
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Leave</CardTitle>
        <CardDescription>
          Submit a new leave request for approval
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleFormSubmit}>
        <CardContent className="space-y-4">
          <LeaveTypeSelector 
            value={leaveType} 
            onChange={setLeaveType} 
          />
          
          <div className="grid grid-cols-2 gap-4">
            <DateSelector
              id="startDate"
              label="Start Date"
              date={startDate}
              onSelect={setStartDate}
            />
            
            <DateSelector
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
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : conflicts.some(c => c.conflictSeverity === 'High') ? 
              "High Priority Conflict Detected" : 
              "Submit Request"
            }
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default LeaveRequestForm;
