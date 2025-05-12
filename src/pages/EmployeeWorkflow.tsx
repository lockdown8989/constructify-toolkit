
import React from 'react';
import { useAuth } from '@/hooks/auth';
import { useIsMobile } from '@/hooks/use-mobile';
import EmployeeScheduleView from '@/components/schedule/EmployeeScheduleView';
import LeaveBalanceCard from '@/components/schedule/LeaveBalanceCard';
import AvailabilityManagement from '@/components/schedule/AvailabilityManagement';
import { cn } from '@/lib/utils';
import { useEmployeeLeave } from '@/hooks/use-employee-leave';
import { useEmployeeDataManagement } from '@/hooks/use-employee-data-management';

const EmployeeWorkflow = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { employeeId } = useEmployeeDataManagement();
  const { data: leaveData, isLoading } = useEmployeeLeave(employeeId);
  
  if (!user) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">My Schedule</h1>
        <p>Please sign in to access your schedule.</p>
      </div>
    );
  }
  
  // Prepare leave balance data from our hook
  const leaveBalance = {
    annual: leaveData?.annual_leave_days || 20,
    sick: leaveData?.sick_leave_days || 10,
    personal: 5, // Default
    used: 12, // Could be calculated from leave calendar in a future update
    remaining: leaveData?.annual_leave_days || 20 // Also could be calculated more accurately
  };
  
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
          {!isMobile && !isLoading && (
            <LeaveBalanceCard leaveBalance={leaveBalance} />
          )}
          <AvailabilityManagement />
        </div>
      </div>
    </div>
  );
};

export default EmployeeWorkflow;
