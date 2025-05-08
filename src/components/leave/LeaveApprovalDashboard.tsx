
import React from "react";
import { useLeaveCalendar } from "@/hooks/use-leave-calendar";
import { useEmployees } from "@/hooks/use-employees";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  LeaveFilters, 
  LeaveRequestsTable,
  useLeaveApprovalActions,
  useLeaveFiltering,
  useRealTimeUpdates
} from "./approval";

const LeaveApprovalDashboard: React.FC = () => {
  const { data: leaves = [], isLoading: isLoadingLeaves } = useLeaveCalendar();
  const { data: employees = [], isLoading: isLoadingEmployees } = useEmployees();
  
  // Mock current user - this should come from a proper auth context in a real app
  const currentUser = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Valentina Cortez",
    department: "HR",
    isManager: true
  };
  
  // Set up real-time updates
  useRealTimeUpdates();
  
  // Get pending leaves
  const pendingLeaves = leaves.filter(leave => leave.status === "Pending");
  
  // Set up filtering
  const {
    selectedEmployee,
    selectedDepartment,
    selectedType,
    setSelectedEmployee,
    setSelectedDepartment,
    setSelectedType,
    departments,
    leaveTypes,
    filteredLeaves,
    getEmployeeName,
    getEmployeeDepartment
  } = useLeaveFiltering(pendingLeaves, employees, currentUser);
  
  // Set up approval actions
  const { handleApprove, handleReject } = useLeaveApprovalActions(currentUser);
  
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
        
        <LeaveFilters
          employees={employees}
          departments={departments}
          leaveTypes={leaveTypes}
          selectedEmployee={selectedEmployee}
          selectedDepartment={selectedDepartment}
          selectedType={selectedType}
          setSelectedEmployee={setSelectedEmployee}
          setSelectedDepartment={setSelectedDepartment}
          setSelectedType={setSelectedType}
        />
      </CardHeader>
      
      <CardContent>
        <LeaveRequestsTable
          leaves={filteredLeaves}
          getEmployeeName={getEmployeeName}
          getEmployeeDepartment={getEmployeeDepartment}
          handleApprove={handleApprove}
          handleReject={handleReject}
        />
      </CardContent>
    </Card>
  );
};

export default LeaveApprovalDashboard;
