
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LeaveRealtimeUpdates from "@/components/leave/LeaveRealtimeUpdates";
import EmployeeTab from "@/components/leave/tabs/EmployeeTab";
import ManagerTab from "@/components/leave/tabs/ManagerTab";
import CalendarTab from "@/components/leave/tabs/CalendarTab";
import NotificationsTab from "@/components/leave/tabs/NotificationsTab";
import { useAccessControl } from "@/hooks/leave/useAccessControl";

const LeaveManagement = () => {
  const { hasManagerAccess } = useAccessControl();
  
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Leave Management System</h1>
      
      {/* Set up real-time updates listener */}
      <LeaveRealtimeUpdates />
      
      <Tabs defaultValue="employee">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="employee">Employee View</TabsTrigger>
          <TabsTrigger value="manager" disabled={!hasManagerAccess}>Manager View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="notifications" disabled={!hasManagerAccess}>Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="employee" className="space-y-4">
          <EmployeeTab />
        </TabsContent>
        
        <TabsContent value="manager">
          <ManagerTab />
        </TabsContent>
        
        <TabsContent value="calendar">
          <CalendarTab />
        </TabsContent>
        
        <TabsContent value="notifications">
          <NotificationsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeaveManagement;
