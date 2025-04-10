
import React, { useState, useEffect } from "react";
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
import { useAccessControl } from "@/hooks/leave/useAccessControl";

// Define the view types
type ViewType = "employee" | "manager" | "calendar" | "notifications";

const LeaveManagement = () => {
  const { hasManagerAccess } = useAccessControl();
  const [currentView, setCurrentView] = useState<ViewType>("employee");
  
  // Force employee view for non-managers
  useEffect(() => {
    if (!hasManagerAccess && currentView !== "employee") {
      setCurrentView("employee");
    }
  }, [hasManagerAccess, currentView]);
  
  // Define view labels
  const viewLabels: Record<ViewType, string> = {
    employee: "Employee View",
    manager: "Manager View",
    calendar: "Calendar View",
    notifications: "Notifications"
  };
  
  // Handle view change
  const handleViewChange = (view: ViewType) => {
    if (view === "manager" || view === "notifications") {
      if (!hasManagerAccess) return;
    }
    setCurrentView(view);
  };
  
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Leave Management System</h1>
      
      {/* Set up real-time updates listener */}
      <LeaveRealtimeUpdates />
      
      {/* Dropdown Menu for Views - Only visible to managers */}
      {hasManagerAccess && (
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
                className="cursor-pointer"
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
                className="cursor-pointer"
              >
                Notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
      
      {/* Content based on selected view */}
      <div className="space-y-4">
        {currentView === "employee" && <EmployeeTab />}
        {currentView === "manager" && <ManagerTab />}
        {currentView === "calendar" && <CalendarTab />}
        {currentView === "notifications" && <NotificationsTab />}
      </div>
    </div>
  );
};

export default LeaveManagement;
