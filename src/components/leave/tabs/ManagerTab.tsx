
import React, { useState } from "react";
import LeaveApprovalDashboard from "@/components/leave/LeaveApprovalDashboard";
import { useAuth } from "@/hooks/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Users, Calendar } from "lucide-react";
import LeaveCalendarView from "@/components/leave/LeaveCalendarView";
import EmployeeScheduleView from "@/components/schedule/EmployeeScheduleView";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useLeaveCalendarState } from "@/hooks/leave/useLeaveCalendarState";
import { useIsMobile } from "@/hooks/use-mobile";

const ManagerTab: React.FC = () => {
  const { isManager, isAdmin, isHR } = useAuth();
  const hasManagerAccess = isManager || isAdmin || isHR;
  const [activeView, setActiveView] = useState<string>("leave-calendar");
  const calendarState = useLeaveCalendarState();
  const isMobile = useIsMobile();

  if (!hasManagerAccess) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        You don't have permission to access this view.
      </div>
    );
  }

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3 border-b">
        <Tabs defaultValue={activeView} onValueChange={setActiveView} className="w-full">
          <TabsList className={`grid ${isMobile ? 'grid-cols-3 gap-0.5' : 'grid-cols-3'} w-full`}>
            <TabsTrigger value="leave-calendar" className={`flex items-center gap-2 ${isMobile ? 'px-1.5 py-1.5 text-xs' : ''}`}>
              <CalendarDays className={`${isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4'}`} />
              <span className={`${isMobile ? 'hidden' : 'hidden sm:inline'}`}>Leave Calendar</span>
              <span className={`${isMobile ? 'text-[10px]' : 'sm:hidden'}`}>Leaves</span>
            </TabsTrigger>
            <TabsTrigger value="shift-schedule" className={`flex items-center gap-2 ${isMobile ? 'px-1.5 py-1.5 text-xs' : ''}`}>
              <Calendar className={`${isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4'}`} />
              <span className={`${isMobile ? 'hidden' : 'hidden sm:inline'}`}>Shift Schedule</span>
              <span className={`${isMobile ? 'text-[10px]' : 'sm:hidden'}`}>Shifts</span>
            </TabsTrigger>
            <TabsTrigger value="approvals" className={`flex items-center gap-2 ${isMobile ? 'px-1.5 py-1.5 text-xs' : ''}`}>
              <Users className={`${isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4'}`} />
              <span className={`${isMobile ? 'hidden' : 'hidden sm:inline'}`}>Approval Dashboard</span>
              <span className={`${isMobile ? 'text-[10px]' : 'sm:hidden'}`}>Approvals</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      
      <CardContent className="p-0">
        <TabsContent value="leave-calendar" className="m-0">
          <div className={`${isMobile ? 'p-2' : 'p-4'}`}>
            <LeaveCalendarView />
          </div>
        </TabsContent>
        
        <TabsContent value="shift-schedule" className="m-0">
          <div className={`${isMobile ? 'p-2' : 'p-4'}`}>
            <EmployeeScheduleView />
          </div>
        </TabsContent>
        
        <TabsContent value="approvals" className="m-0">
          <div className={`${isMobile ? 'p-2' : 'p-4'}`}>
            <LeaveApprovalDashboard />
          </div>
        </TabsContent>
      </CardContent>
    </Card>
  );
};

export default ManagerTab;
