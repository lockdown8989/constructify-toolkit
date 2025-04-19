import React from 'react';
import { useAuth } from '@/hooks/auth';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EmployeeScheduleView from '@/components/schedule/EmployeeScheduleView';
import TimeClockWidget from '@/components/schedule/TimeClockWidget';
import LeaveBalanceCard from '@/components/schedule/LeaveBalanceCard';
import AvailabilityManagement from '@/components/schedule/AvailabilityManagement';
import { cn } from '@/lib/utils';

const EmployeeWorkflow = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  if (!user) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Employee Workflow</h1>
        <p>Please sign in to access your schedule.</p>
      </div>
    );
  }
  
  return (
    <div className={cn(
      "min-h-screen bg-gray-50",
      isMobile ? "p-0" : "container py-6"
    )}>
      <div className={cn(
        "bg-white",
        isMobile ? "" : "rounded-lg shadow-sm"
      )}>
        <Tabs defaultValue="shifts" className="w-full">
          <TabsList className="w-full border-b rounded-none p-0 h-12">
            <TabsTrigger 
              value="shifts"
              className="flex-1 h-12 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              Open Shifts Employee
            </TabsTrigger>
            <TabsTrigger 
              value="timeclock"
              className="flex-1 h-12 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              Time Clock
            </TabsTrigger>
            <TabsTrigger 
              value="availability"
              className="flex-1 h-12 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              Availability
            </TabsTrigger>
            <TabsTrigger 
              value="leave"
              className="flex-1 h-12 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              Leave
            </TabsTrigger>
          </TabsList>

          <TabsContent value="shifts" className="p-4">
            <EmployeeScheduleView />
          </TabsContent>

          <TabsContent value="timeclock" className="p-4">
            <TimeClockWidget />
          </TabsContent>

          <TabsContent value="availability" className="p-4">
            <AvailabilityManagement />
          </TabsContent>

          <TabsContent value="leave" className="p-4">
            <LeaveBalanceCard 
              leaveBalance={{
                annual: 20,
                sick: 10,
                personal: 5,
                used: 12,
                remaining: 23
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EmployeeWorkflow;
