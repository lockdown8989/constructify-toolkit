
import React, { useState } from "react";
import LeaveApprovalDashboard from "@/components/leave/LeaveApprovalDashboard";
import { useAuth } from "@/hooks/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CalendarDays, Shield, Users } from "lucide-react";
import LeaveCalendarView from "@/components/leave/LeaveCalendarView";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLeaveCalendarState } from "@/hooks/leave/useLeaveCalendarState";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "@/components/ui/use-toast";

const ManagerTab: React.FC = () => {
  const { isManager, isAdmin, isHR, user } = useAuth();
  const hasManagerAccess = isManager || isAdmin || isHR;
  const [activeTab, setActiveTab] = useState<string>("leave-calendar");
  const calendarState = useLeaveCalendarState();
  const isMobile = useIsMobile();

  // If user tries to access this but doesn't have manager access, show message and notify
  if (!hasManagerAccess) {
    React.useEffect(() => {
      toast({
        title: "Access Restricted",
        description: "You don't have manager-level permissions to view this page.",
        variant: "destructive",
      });
    }, []);
    
    return (
      <div className="p-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-amber-500 mb-4" />
        <h3 className="text-lg font-medium mb-2">Manager Access Required</h3>
        <p className="text-muted-foreground mb-4">
          You don't have permission to access this view. Please contact your administrator if you believe this is an error.
        </p>
        <Shield className="mx-auto h-8 w-8 text-muted-foreground opacity-50" />
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
