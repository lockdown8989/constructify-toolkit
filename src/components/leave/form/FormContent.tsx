
import React from "react";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import LeaveTypeSelector from "./LeaveTypeSelector";
import DateSelector from "./DateSelector";
import NotesField from "./NotesField";
import ProjectConflicts from "../ProjectConflicts";

interface FormContentProps {
  leaveType: string;
  setLeaveType: (value: string) => void;
  startDate: Date | undefined;
  setStartDate: (date: Date | undefined) => void;
  endDate: Date | undefined;
  setEndDate: (date: Date | undefined) => void;
  notes: string;
  setNotes: (notes: string) => void;
  isSubmitting: boolean;
  conflicts: any[];
  formStatus: string;
  handleSubmit: (e: React.FormEvent) => void;
}

const FormContent: React.FC<FormContentProps> = ({
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
  formStatus,
  handleSubmit,
}) => {
  return (
    <>
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

        {formStatus === 'submitting' && (
          <Alert className="mt-4 animate-pulse">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            <AlertTitle>Processing your request</AlertTitle>
            <AlertDescription>
              Please wait while we submit your leave request.
              Do not close this page.
            </AlertDescription>
          </Alert>
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
    </>
  );
};

export default FormContent;
