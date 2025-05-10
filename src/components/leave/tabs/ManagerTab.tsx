
import React, { useState } from "react";
import LeaveApprovalDashboard from "@/components/leave/LeaveApprovalDashboard";
import { useAuth } from "@/hooks/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Users } from "lucide-react";
import LeaveCalendarView from "@/components/leave/LeaveCalendarView";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLeaveCalendarState } from "@/hooks/leave/useLeaveCalendarState";
import { useIsMobile } from "@/hooks/use-mobile";

const ManagerTab: React.FC = () => {
  const { isManager, isAdmin, isHR } = useAuth();
  const hasManagerAccess = isManager || isAdmin || isHR;
  const [activeTab, setActiveTab] = useState<string>("leave-calendar");
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
        <CardTitle className="flex items-center text-lg">
          <Users className="h-5 w-5 mr-2 text-primary" />
          Team Management
        </CardTitle>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-2">
          <TabsList className={`grid ${isMobile ? 'grid-cols-2 gap-0.5' : 'grid-cols-2'} w-full`}>
            <TabsTrigger 
              value="leave-calendar" 
              className={`flex items-center gap-2 ${isMobile ? 'px-3 py-1.5' : ''}`}
            >
              <CalendarDays className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'}`} />
              <span className={`${isMobile ? 'text-sm' : ''}`}>Leave Calendar</span>
            </TabsTrigger>
            <TabsTrigger 
              value="approvals" 
              className={`flex items-center gap-2 ${isMobile ? 'px-3 py-1.5' : ''}`}
            >
              <Users className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'}`} />
              <span className={`${isMobile ? 'text-sm' : ''}`}>Approval Dashboard</span>
            </TabsTrigger>
          </TabsList>
        
          <TabsContent value="leave-calendar" className="mt-4 pt-2">
            <LeaveCalendarView />
          </TabsContent>
          
          <TabsContent value="approvals" className="mt-4 pt-2">
            <LeaveApprovalDashboard />
          </TabsContent>
        </Tabs>
      </CardHeader>
    </Card>
  );
};

export default ManagerTab;
