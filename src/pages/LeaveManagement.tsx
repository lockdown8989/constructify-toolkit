
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Calendar, Users, Bell, RefreshCw, Clock, History, CalendarPlus } from "lucide-react";
import LeaveRealtimeUpdates from "@/components/leave/LeaveRealtimeUpdates";
import EmployeeTab from "@/components/leave/tabs/EmployeeTab";
import ManagerTab from "@/components/leave/tabs/ManagerTab";
import CalendarTab from "@/components/leave/tabs/CalendarTab";
import NotificationsTab from "@/components/leave/tabs/NotificationsTab";
import ScheduleRequestsTab from "@/components/leave/tabs/ScheduleRequestsTab"; 
import ShiftHistoryTab from "@/components/leave/tabs/ShiftHistoryTab";
import { useAccessControl } from "@/hooks/leave/useAccessControl";
import { useLocation } from "react-router-dom";
import LeaveRequestForm from "@/components/leave/LeaveRequestForm";

// Define the view types
type ViewType = "employee" | "manager" | "calendar" | "notifications" | "schedule-requests" | "shift-history" | "form";

// Define the view option type
type ViewOption = {
  label: string;
  icon: React.ReactNode;
};

const LeaveManagement = () => {
  const { hasManagerAccess } = useAccessControl();
  const [currentView, setCurrentView] = useState<ViewType>("employee");
  const location = useLocation();

  // Set initial view based on URL state (if provided)
  useEffect(() => {
    if (location.state && location.state.initialView) {
      const initialView = location.state.initialView as ViewType;
      if (
        (initialView !== "manager" && initialView !== "notifications") || 
        (hasManagerAccess && (initialView === "manager" || initialView === "notifications"))
      ) {
        setCurrentView(initialView);
      }
    }
  }, [location.state, hasManagerAccess]);

  // Define view options based on user access
  const getViewOptions = (): Record<string, ViewOption> => {
    const baseOptions: Record<string, ViewOption> = {
      employee: { label: "Employee View", icon: <Users className="h-4 w-4 mr-2" /> },
      "shift-history": { label: "Shift History", icon: <History className="h-4 w-4 mr-2" /> },
      calendar: { label: "Calendar View", icon: <Calendar className="h-4 w-4 mr-2" /> },
      "schedule-requests": { label: "Schedule Requests", icon: <Clock className="h-4 w-4 mr-2" /> },
      form: { label: "Request Leave", icon: <CalendarPlus className="h-4 w-4 mr-2" /> }
    };

    // Only add manager and notifications options if user has manager access
    if (hasManagerAccess) {
      return {
        ...baseOptions,
        manager: { label: "Manager View", icon: <Users className="h-4 w-4 mr-2" /> },
        notifications: { label: "Notifications", icon: <Bell className="h-4 w-4 mr-2" /> }
      };
    }

    return baseOptions;
  };

  const viewOptions = getViewOptions();

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Leave Management System</h1>
      
      <LeaveRealtimeUpdates />
      
      <div className="mb-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full md:w-auto flex justify-between items-center">
              {viewOptions[currentView]?.icon}
              {viewOptions[currentView]?.label}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full min-w-[200px]">
            <DropdownMenuItem 
              onClick={() => setCurrentView("employee")}
              className="cursor-pointer flex items-center"
            >
              <Users className="h-4 w-4 mr-2" />
              Employee View
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={() => setCurrentView("shift-history")}
              className="cursor-pointer flex items-center"
            >
              <History className="h-4 w-4 mr-2" />
              Shift History
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={() => setCurrentView("calendar")}
              className="cursor-pointer flex items-center"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Calendar View
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={() => setCurrentView("schedule-requests")}
              className="cursor-pointer flex items-center"
            >
              <Clock className="h-4 w-4 mr-2" />
              Schedule Requests
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={() => setCurrentView("form")}
              className="cursor-pointer flex items-center"
            >
              <CalendarPlus className="h-4 w-4 mr-2" />
              Request Leave
            </DropdownMenuItem>

            {hasManagerAccess && (
              <>
                <DropdownMenuItem 
                  onClick={() => setCurrentView("manager")}
                  className="cursor-pointer flex items-center"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Manager View
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => setCurrentView("notifications")}
                  className="cursor-pointer flex items-center"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="space-y-4">
        {currentView === "employee" && <EmployeeTab />}
        {currentView === "shift-history" && <ShiftHistoryTab />}
        {currentView === "manager" && hasManagerAccess && <ManagerTab />}
        {currentView === "calendar" && <CalendarTab />}
        {currentView === "notifications" && hasManagerAccess && <NotificationsTab />}
        {currentView === "schedule-requests" && <ScheduleRequestsTab />}
        {currentView === "form" && (
          <div className="max-w-2xl mx-auto">
            <LeaveRequestForm />
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveManagement;
