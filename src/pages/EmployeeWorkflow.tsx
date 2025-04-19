
import React from 'react';
import { useAuth } from '@/hooks/auth';
import { useIsMobile } from '@/hooks/use-mobile';
import EmployeeScheduleView from '@/components/schedule/EmployeeScheduleView';
import LeaveBalanceCard from '@/components/schedule/LeaveBalanceCard';

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
    <div className="container py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <EmployeeScheduleView />
        </div>
        <div>
          <LeaveBalanceCard />
        </div>
      </div>
    </div>
  );
};

export default EmployeeWorkflow;
