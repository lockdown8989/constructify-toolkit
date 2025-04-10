
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, FileText, Users, Bell } from "lucide-react";
import LeaveRealtimeUpdates from "@/components/leave/LeaveRealtimeUpdates";
import EmployeeTab from "@/components/leave/tabs/EmployeeTab";
import ManagerTab from "@/components/leave/tabs/ManagerTab";
import CalendarTab from "@/components/leave/tabs/CalendarTab";
import NotificationsTab from "@/components/leave/tabs/NotificationsTab";
import { useAccessControl } from "@/hooks/leave/useAccessControl";

const LeaveManagement = () => {
  const { hasManagerAccess } = useAccessControl();
  
  return (
    <div className="container py-6 animate-fade-in">
      <div className="flex flex-col space-y-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Leave Management</h1>
        <p className="text-muted-foreground max-w-3xl">
          Request time off, view team availability, and manage leave approvals all in one place.
        </p>
      </div>
      
      {/* Set up real-time updates listener */}
      <LeaveRealtimeUpdates />
      
      <Tabs defaultValue="employee" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6 h-auto p-1 bg-muted/80">
          <TabsTrigger value="employee" className="flex items-center gap-2 py-3 data-[state=active]:bg-white">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Employee View</span>
            <span className="sm:hidden">Employee</span>
          </TabsTrigger>
          <TabsTrigger value="manager" disabled={!hasManagerAccess} className="flex items-center gap-2 py-3 data-[state=active]:bg-white">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Manager View</span>
            <span className="sm:hidden">Manager</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2 py-3 data-[state=active]:bg-white">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Calendar View</span>
            <span className="sm:hidden">Calendar</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" disabled={!hasManagerAccess} className="flex items-center gap-2 py-3 data-[state=active]:bg-white">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
            <span className="sm:hidden">Alerts</span>
          </TabsTrigger>
        </TabsList>
        
        <div className="bg-white p-4 sm:p-6 rounded-md shadow-sm border">
          <TabsContent value="employee" className="space-y-4 mt-2">
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
        </div>
      </Tabs>
    </div>
  );
};

export default LeaveManagement;
