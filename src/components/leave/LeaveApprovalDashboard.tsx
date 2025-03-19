
import React, { useState } from "react";
import { format, addDays } from "date-fns";
import { useLeaveCalendar, useUpdateLeaveCalendar } from "@/hooks/leave-calendar";
import { useEmployees, useUpdateEmployee } from "@/hooks/use-employees";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ApprovalFilters from "./approval/ApprovalFilters";
import ApprovalTable from "./approval/ApprovalTable";
import { calculateLeaveDays, createAuditLog, filterLeaves } from "./approval/approval-utils";
import type { LeaveCalendar } from "@/hooks/leave-calendar";

const LeaveApprovalDashboard: React.FC = () => {
  // Get the first day of three months ago and the last day of next month for a good date range
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  threeMonthsAgo.setDate(1);
  const startDate = format(threeMonthsAgo, 'yyyy-MM-dd');
  
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  nextMonth.setDate(0); // Last day of next month
  const endDate = format(nextMonth, 'yyyy-MM-dd');
  
  const { data: leaves = [], isLoading: isLoadingLeaves } = useLeaveCalendar(startDate, endDate);
  const { data: employees = [], isLoading: isLoadingEmployees } = useEmployees();
  const { mutate: updateLeave } = useUpdateLeaveCalendar();
  const { mutate: updateEmployee } = useUpdateEmployee();
  const { toast } = useToast();
  
  // Mock current user for demo purposes
  // In a real app, this would come from authentication context
  const currentUser = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Valentina Cortez",
    department: "HR",
    isManager: true
  };
  
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  
  // Get only pending leave requests for the approval table
  const pendingLeaves = leaves.filter(leave => leave.status === "Pending");
  
  // Apply filters and security permissions
  const filteredLeaves = filterLeaves(
    pendingLeaves,
    employees,
    currentUser,
    selectedEmployee,
    selectedDepartment,
    selectedType
  );
  
  // Get unique departments for filter
  const departments = [...new Set(employees.map(emp => emp.department))];
  
  // Get unique leave types for filter
  const leaveTypes = [...new Set(leaves.map(leave => leave.type))];

  // Update employee status to "On Leave" when leave is approved
  const updateEmployeeStatus = (employeeId: string, startDate: string, endDate: string) => {
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Only update status if leave period includes current date
    if (today >= start && today <= end) {
      updateEmployee(
        { id: employeeId, status: "Leave" },
        {
          onError: (error) => {
            console.error("Error updating employee status:", error);
            toast({
              title: "Error",
              description: "Failed to update employee status.",
              variant: "destructive",
            });
          },
        }
      );
    }
  };
  
  const handleApprove = (leave: LeaveCalendar) => {
    const auditLog = createAuditLog(leave, "Approved", currentUser.name);
    
    updateLeave(
      { id: leave.id, status: "Approved", notes: auditLog },
      {
        onSuccess: () => {
          // Update employee status if leave includes current date
          updateEmployeeStatus(leave.employee_id, leave.start_date, leave.end_date);
          
          toast({
            title: "Leave approved",
            description: "The leave request has been approved successfully.",
          });
        },
        onError: (error) => {
          console.error("Error approving leave:", error);
          toast({
            title: "Error",
            description: "Failed to approve the leave request. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };
  
  const handleReject = (leave: LeaveCalendar) => {
    const auditLog = createAuditLog(leave, "Rejected", currentUser.name);
    
    updateLeave(
      { id: leave.id, status: "Rejected", notes: auditLog },
      {
        onSuccess: () => {
          toast({
            title: "Leave rejected",
            description: "The leave request has been rejected.",
          });
        },
        onError: (error) => {
          console.error("Error rejecting leave:", error);
          toast({
            title: "Error",
            description: "Failed to reject the leave request. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };
  
  const getEmployeeName = (employeeId: string): string => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.name : "Unknown Employee";
  };
  
  const getEmployeeDepartment = (employeeId: string): string => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.department : "Unknown";
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
          departments={departments}
          leaveTypes={leaveTypes}
          selectedEmployee={selectedEmployee}
          selectedDepartment={selectedDepartment}
          selectedType={selectedType}
          onEmployeeChange={setSelectedEmployee}
          onDepartmentChange={setSelectedDepartment}
          onTypeChange={setSelectedType}
        />
      </CardHeader>
      
      <CardContent>
        <ApprovalTable
          leaves={filteredLeaves}
          getEmployeeName={getEmployeeName}
          getEmployeeDepartment={getEmployeeDepartment}
          calculateLeaveDays={calculateLeaveDays}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </CardContent>
    </Card>
  );
};

export default LeaveApprovalDashboard;
