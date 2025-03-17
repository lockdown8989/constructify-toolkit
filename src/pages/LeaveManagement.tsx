
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LeaveRequestForm from "@/components/leave/LeaveRequestForm";
import LeaveApprovalDashboard from "@/components/leave/LeaveApprovalDashboard";
import LeaveCalendarView from "@/components/leave/LeaveCalendarView";

const LeaveManagement = () => {
  // For demonstration purposes, we're using a hardcoded employee ID
  // In a real app, this would come from authentication/user context
  const currentEmployeeId = "550e8400-e29b-41d4-a716-446655440000";
  
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Leave Management</h1>
      
      <Tabs defaultValue="employee">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="employee">Employee View</TabsTrigger>
          <TabsTrigger value="manager">Manager View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="employee" className="space-y-4">
          <div className="max-w-md mx-auto">
            <LeaveRequestForm employeeId={currentEmployeeId} />
          </div>
        </TabsContent>
        
        <TabsContent value="manager">
          <LeaveApprovalDashboard />
        </TabsContent>
        
        <TabsContent value="calendar">
          <LeaveCalendarView />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeaveManagement;
