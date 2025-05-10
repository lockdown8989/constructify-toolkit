
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar, Clock, Users, PieChart, CheckSquare, CalendarDays } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const RotaCloudFeatures = () => {
  const [activeTab, setActiveTab] = useState("time-tracking");
  const navigate = useNavigate();
  const { isAdmin, isHR, isManager } = useAuth();
  const isMobile = useIsMobile();
  
  // Determine if user has manager-level access
  const hasManagerAccess = isAdmin || isHR || isManager;
  
  return (
    <Card className="border-none shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold">Workforce Management</CardTitle>
        <CardDescription>
          Track time, manage shifts and streamline scheduling
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs 
          defaultValue={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 mb-2 p-1 w-full h-auto">
            <TabsTrigger value="time-tracking" className={cn("text-xs py-1 h-auto", isMobile && "text-[10px]")}>
              Time Tracking
            </TabsTrigger>
            <TabsTrigger value="shift-planning" className={cn("text-xs py-1 h-auto", isMobile && "text-[10px]")}>
              Shift Planning
            </TabsTrigger>
            <TabsTrigger value="reporting" className={cn("text-xs py-1 h-auto", isMobile && "text-[10px]")}>
              Reporting
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="time-tracking" className="p-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FeatureCard
                icon={<Clock className="h-5 w-5" />}
                title="Digital Time Clock"
                description="Clock in & out from any device, with break tracking"
                action={() => navigate('/time-clock')}
                actionText="Time Clock"
              />
              <FeatureCard
                icon={<CheckSquare className="h-5 w-5" />}
                title="Automatic Timesheets"
                description="Timesheets generated automatically from clock data"
                action={() => navigate('/attendance')}
                actionText="View Timesheets"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="shift-planning" className="p-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FeatureCard
                icon={<CalendarDays className="h-5 w-5" />}
                title="Visual Schedule"
                description="Drag & drop shift planning with color coding"
                action={() => navigate('/schedule')}
                actionText="View Schedule"
              />
              <FeatureCard
                icon={<Users className="h-5 w-5" />}
                title={hasManagerAccess ? "Shift Management" : "Shift Requests"}
                description={hasManagerAccess ? "Assign shifts and manage staff availability" : "Request time off and view upcoming shifts"}
                action={() => navigate(hasManagerAccess ? '/restaurant-schedule' : '/schedule-requests')}
                actionText={hasManagerAccess ? "Manage Shifts" : "My Shifts"}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="reporting" className="p-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FeatureCard
                icon={<PieChart className="h-5 w-5" />}
                title="Labor Reports"
                description="Track labor costs and analyze schedule efficiency"
                action={() => navigate(hasManagerAccess ? '/payroll' : '/profile')}
                actionText={hasManagerAccess ? "View Reports" : "My Hours"}
              />
              <FeatureCard
                icon={<Calendar className="h-5 w-5" />}
                title="Attendance Analytics"
                description="Track attendance patterns and time off usage"
                action={() => navigate(hasManagerAccess ? '/leave-management' : '/leave')}
                actionText="Attendance Records"
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: () => void;
  actionText: string;
}

const FeatureCard = ({ icon, title, description, action, actionText }: FeatureCardProps) => {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
      <div className="flex items-center mb-2">
        <div className="bg-blue-50 p-2 rounded-md text-blue-600 mr-3">
          {icon}
        </div>
        <h3 className="font-semibold">{title}</h3>
      </div>
      <p className="text-gray-600 text-sm mb-3">{description}</p>
      <Button variant="outline" size="sm" onClick={action} className="w-full">
        {actionText}
      </Button>
    </div>
  );
};

export default RotaCloudFeatures;
