
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import LeaveRealtimeUpdates from "@/components/leave/LeaveRealtimeUpdates";
import EmployeeTab from "@/components/leave/tabs/EmployeeTab";
import ManagerTab from "@/components/leave/tabs/ManagerTab";
import CalendarTab from "@/components/leave/tabs/CalendarTab";
import NotificationsTab from "@/components/leave/tabs/NotificationsTab";
import ScheduleRequestsTab from "@/components/leave/tabs/ScheduleRequestsTab"; 
import { useAccessControl } from "@/hooks/leave/useAccessControl";

// Define the view types
type ViewType = "employee" | "manager" | "calendar" | "notifications" | "schedule-requests";

const LeaveManagement = () => {
  const { hasManagerAccess } = useAccessControl();
  const [currentView, setCurrentView] = useState<ViewType>("employee");
  
  // Define view labels
  const viewLabels: Record<ViewType, string> = {
    employee: "Employee View",
    manager: "Manager View",
    calendar: "Calendar View",
    notifications: "Notifications",
    "schedule-requests": "Schedule Requests"
  };
  
  // Handle view change
  const handleViewChange = (view: ViewType) => {
    if ((view === "manager" || view === "notifications") && !hasManagerAccess) {
      return;
    }
    setCurrentView(view);
  };
  
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Leave Management System</h1>
      
      {/* Set up real-time updates listener */}
      <LeaveRealtimeUpdates />
      
      {/* Dropdown Menu for Views */}
      <div className="mb-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full md:w-auto flex justify-between items-center">
              {viewLabels[currentView]}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full min-w-[200px]">
            <DropdownMenuItem 
              onClick={() => handleViewChange("employee")}
              className="cursor-pointer"
            >
              Employee View
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={() => handleViewChange("manager")}
              disabled={!hasManagerAccess}
              className={`cursor-pointer ${!hasManagerAccess ? 'opacity-50' : ''}`}
            >
              Manager View
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={() => handleViewChange("calendar")}
              className="cursor-pointer"
            >
              Calendar View
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={() => handleViewChange("notifications")}
              disabled={!hasManagerAccess}
              className={`cursor-pointer ${!hasManagerAccess ? 'opacity-50' : ''}`}
            >
              Notifications
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={() => handleViewChange("schedule-requests")}
              className="cursor-pointer"
            >
              Schedule Requests
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Content based on selected view */}
      <div className="space-y-4">
        {currentView === "employee" && <EmployeeTab />}
        {currentView === "manager" && <ManagerTab />}
        {currentView === "calendar" && <CalendarTab />}
        {currentView === "notifications" && <NotificationsTab />}
        {currentView === "schedule-requests" && <ScheduleRequestsTab />}
      </div>
    </div>
  );
};

export default LeaveManagement;
