
import { useAuth } from "@/hooks/auth";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import RotaCloudFeatures from "@/components/dashboard/RotaCloudFeatures";
import DashboardCalendar from "@/components/dashboard/DashboardCalendar";
import DashboardTimeClock from "@/components/dashboard/DashboardTimeClock";
import EmployeeTimeClock from "@/components/dashboard/EmployeeTimeClock";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";

const Dashboard = () => {
  const { user, isAdmin, isHR, isManager } = useAuth();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("home");
  
  useEffect(() => {
    document.title = "Dashboard | Team Management";
  }, []);

  return (
    <div className="container py-6">
      <DashboardHeader />
      
      {/* Mobile tabs for easy navigation */}
      {isMobile && (
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="mb-4"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="home">Home</TabsTrigger>
            <TabsTrigger value="time">Time</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>
          
          <TabsContent value="home" className="mt-4 space-y-4">
            <RotaCloudFeatures />
            <DashboardCalendar />
          </TabsContent>
          
          <TabsContent value="time" className="mt-4">
            <EmployeeTimeClock />
          </TabsContent>
          
          <TabsContent value="schedule" className="mt-4">
            <DashboardCalendar />
          </TabsContent>
        </Tabs>
      )}
      
      {/* Desktop layout */}
      {!isMobile && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <RotaCloudFeatures />
            <DashboardCalendar />
          </div>
          <div className="space-y-6">
            <EmployeeTimeClock />
            {/* Additional company announcements or widgets could go here */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm">
                  <li className="py-1 px-2 hover:bg-slate-50 rounded-md cursor-pointer">
                    Request time off
                  </li>
                  <li className="py-1 px-2 hover:bg-slate-50 rounded-md cursor-pointer">
                    View upcoming shifts
                  </li>
                  <li className="py-1 px-2 hover:bg-slate-50 rounded-md cursor-pointer">
                    Submit timesheet
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
