
import React, { useState, useEffect } from "react";
import LeaveRealtimeUpdates from "@/components/leave/LeaveRealtimeUpdates";
import EmployeeTab from "@/components/leave/tabs/EmployeeTab";
import ManagerTab from "@/components/leave/tabs/ManagerTab";
import CalendarTab from "@/components/leave/tabs/CalendarTab";
import ScheduleRequestsTab from "@/components/leave/tabs/ScheduleRequestsTab"; 
import ShiftHistoryTab from "@/components/leave/tabs/ShiftHistoryTab";
import { useAccessControl } from "@/hooks/leave/useAccessControl";
import { useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

// Define the view types
type ViewType = "employee" | "manager" | "calendar" | "schedule-requests" | "shift-history";

const LeaveManagement = () => {
  const { hasManagerAccess } = useAccessControl();
  const isMobile = useIsMobile();
  const [currentView, setCurrentView] = useState<ViewType>("employee");
  const location = useLocation();

  // Set initial view based on URL state (if provided)
  useEffect(() => {
    if (location.state && location.state.initialView) {
      const initialView = location.state.initialView as ViewType;
      if (
        (initialView !== "manager") || 
        (hasManagerAccess && (initialView === "manager"))
      ) {
        setCurrentView(initialView);
      }
    }
    
    // Default to shift-history view for managers
    if (hasManagerAccess && !location.state?.initialView) {
      setCurrentView("shift-history");
    }
  }, [location.state, hasManagerAccess]);

  return (
    <div className={`${isMobile ? 'px-0 py-2' : 'container py-6'}`}>
      <LeaveRealtimeUpdates />
      
      <div className={`${isMobile ? 'space-y-2' : 'space-y-4'}`}>
        {currentView === "employee" && <EmployeeTab />}
        {currentView === "shift-history" && <ShiftHistoryTab />}
        {currentView === "manager" && hasManagerAccess && <ManagerTab />}
        {currentView === "calendar" && <CalendarTab />}
        {currentView === "schedule-requests" && <ScheduleRequestsTab />}
      </div>
    </div>
  );
};

export default LeaveManagement;
