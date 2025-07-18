
import React, { useState, useEffect } from "react";
import LeaveRealtimeUpdates from "@/components/leave/LeaveRealtimeUpdates";
import EmployeeTab from "@/components/leave/tabs/EmployeeTab";
import ManagerTab from "@/components/leave/tabs/ManagerTab";
import CalendarTab from "@/components/leave/tabs/CalendarTab";
import ScheduleRequestsTab from "@/components/leave/tabs/ScheduleRequestsTab"; 
import ShiftHistoryTab from "@/components/leave/tabs/ShiftHistoryTab";
import LeaveApprovalDashboard from "@/components/leave/LeaveApprovalDashboard";
import LeaveCalendarView from "@/components/leave/LeaveCalendarView";
import { useAccessControl } from "@/hooks/leave/useAccessControl";
import { useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Users, Clock } from "lucide-react";

// Define the view types
type ViewType = "employee" | "leave-calendar" | "approval-dashboard" | "calendar" | "schedule-requests" | "shift-history";

const LeaveManagement = () => {
  const { hasManagerAccess } = useAccessControl();
  const isMobile = useIsMobile();
  const [currentView, setCurrentView] = useState<ViewType>("employee");
  const location = useLocation();

  // Set initial view based on URL state (if provided)
  useEffect(() => {
    if (location.state && location.state.initialView) {
      const initialView = location.state.initialView as ViewType;
      setCurrentView(initialView);
    }
    
    // Default to approval-dashboard view for managers
    if (hasManagerAccess && !location.state?.initialView) {
      setCurrentView("approval-dashboard");
    }
  }, [location.state, hasManagerAccess]);

  return (
    <div className={`${isMobile ? 'px-0 py-2' : 'container py-6'}`}>
      <LeaveRealtimeUpdates />
      
      {hasManagerAccess ? (
        <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as ViewType)} className="w-full">
          <TabsList className={`grid ${isMobile ? 'grid-cols-2 gap-0.5' : 'grid-cols-2'} w-full mb-4`}>
            <TabsTrigger 
              value="leave-calendar" 
              className={`flex items-center gap-2 ${isMobile ? 'px-3 py-2' : ''}`}
            >
              <CalendarDays className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'}`} />
              <span className={`${isMobile ? 'text-sm' : ''}`}>Leave Calendar</span>
            </TabsTrigger>
            <TabsTrigger 
              value="approval-dashboard" 
              className={`flex items-center gap-2 ${isMobile ? 'px-3 py-2' : ''}`}
            >
              <Users className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'}`} />
              <span className={`${isMobile ? 'text-sm' : ''}`}>Approval Dashboard</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="leave-calendar" className="mt-0">
            <LeaveCalendarView />
          </TabsContent>
          
          <TabsContent value="approval-dashboard" className="mt-0">
            <LeaveApprovalDashboard />
          </TabsContent>
        </Tabs>
      ) : (
        <div className={`${isMobile ? 'space-y-2' : 'space-y-4'}`}>
          {currentView === "employee" && <EmployeeTab />}
          {currentView === "calendar" && <CalendarTab />}
          {currentView === "schedule-requests" && <ScheduleRequestsTab />}
          {currentView === "shift-history" && <ShiftHistoryTab />}
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;
