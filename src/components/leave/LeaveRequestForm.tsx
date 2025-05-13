
import React from "react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { useLeaveRequestForm } from "./form/useLeaveRequestForm";
import { useQueryClient } from "@tanstack/react-query";
import FormContent from "./form/FormContent";
import SuccessState from "./form/FormStates/SuccessState";
import ErrorState from "./form/FormStates/ErrorState";
import LoadingState from "./form/FormStates/LoadingState";
import NoEmployeeState from "./form/FormStates/NoEmployeeState";

const LeaveRequestForm: React.FC = () => {
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
    return <LoadingState />;
  }
  
  // Show message if no employee record found
  if (!currentEmployee) {
    return <NoEmployeeState />;
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
    return <SuccessState />;
  }
  
  // If there's an error with the form, show error state
  if (formStatus === 'error') {
    return <ErrorState />;
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
        <FormContent
          leaveType={leaveType}
          setLeaveType={setLeaveType}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          notes={notes}
          setNotes={setNotes}
          isSubmitting={isSubmitting}
          conflicts={conflicts}
          formStatus={formStatus}
          handleSubmit={handleSubmit}
        />
      </form>
    </Card>
  );
};

export default LeaveRequestForm;
