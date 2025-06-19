
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
import { ClipboardCheck } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/use-auth";

const LeaveApprovalDashboard: React.FC = () => {
  const { data: leaves = [], isLoading: isLoadingLeaves } = useLeaveCalendar();
  const { data: employees = [], isLoading: isLoadingEmployees } = useEmployees();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  
  // Get current user info from auth context
  const currentUser = {
    id: user?.id || "",
    name: user?.user_metadata?.full_name || user?.user_metadata?.name || "Manager",
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
    return <div className="flex justify-center p-6">Loading leave requests...</div>;
  }
  
  return (
    <Card className="border shadow-sm">
      <CardHeader className={`${isMobile ? 'p-3' : 'p-4'} pb-3 border-b`}>
        <div className="flex items-center mb-2">
          <ClipboardCheck className="h-5 w-5 mr-2 text-primary" />
          <CardTitle>Leave Approval Dashboard</CardTitle>
        </div>
        <CardDescription className="text-sm text-muted-foreground">
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
      
      <CardContent className={`${isMobile ? 'p-2' : 'p-4'}`}>
        {filteredLeaves.length > 0 ? (
          <LeaveRequestsTable
            leaves={filteredLeaves}
            getEmployeeName={getEmployeeName}
            getEmployeeDepartment={getEmployeeDepartment}
            handleApprove={handleApprove}
            handleReject={handleReject}
          />
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No pending leave requests found
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LeaveApprovalDashboard;
