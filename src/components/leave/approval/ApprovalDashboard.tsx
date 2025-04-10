
import React from "react";
import { useLeaveCalendar } from "@/hooks/use-leave-calendar";
import { useEmployees } from "@/hooks/use-employees";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import ApprovalFilters from "./ApprovalFilters";
import PendingLeaveTable from "./PendingLeaveTable";

const ApprovalDashboard: React.FC = () => {
  const { data: leaves = [], isLoading: isLoadingLeaves } = useLeaveCalendar();
  const { data: employees = [], isLoading: isLoadingEmployees } = useEmployees();
  
  // Current user info (will be replaced with actual auth in a real app)
  const currentUser = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Valentina Cortez",
    department: "HR",
    isManager: true
  };
  
  if (isLoadingLeaves || isLoadingEmployees) {
    return <div className="flex justify-center p-6">Loading...</div>;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave Approval Dashboard</CardTitle>
        <CardDescription>
          Review and manage employee leave requests
        </CardDescription>
        <ApprovalFilters 
          employees={employees} 
          leaves={leaves}
        />
      </CardHeader>
      <CardContent>
        <PendingLeaveTable 
          leaves={leaves} 
          employees={employees} 
          currentUser={currentUser} 
        />
      </CardContent>
    </Card>
  );
};

export default ApprovalDashboard;
