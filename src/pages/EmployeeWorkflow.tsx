
import React from 'react';
import { useAuth } from '@/hooks/auth';
import { useIsMobile } from '@/hooks/use-mobile';
import EmployeeScheduleView from '@/components/schedule/EmployeeScheduleView';
import LeaveBalanceCard from '@/components/schedule/LeaveBalanceCard';
import AvailabilityManagement from '@/components/schedule/AvailabilityManagement';
import { cn } from '@/lib/utils';

const EmployeeWorkflow = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  if (!user) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">My Schedule</h1>
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
        "grid gap-6",
        isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-3"
      )}>
        <div className={cn(
          "bg-white",
          isMobile ? "" : "md:col-span-2 rounded-lg shadow-sm"
        )}>
          <EmployeeScheduleView />
        </div>
        <div className="space-y-6">
          {!isMobile && (
            <LeaveBalanceCard 
              leaveBalance={{
                annual: 20,
                sick: 10,
                personal: 5,
                used: 12,
                remaining: 23
              }} 
            />
          )}
          <AvailabilityManagement />
        </div>
      </div>
    </div>
  );
};

export default EmployeeWorkflow;
