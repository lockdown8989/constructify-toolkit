
import React from 'react';
import { useAuth } from '@/hooks/auth';
import { useIsMobile } from '@/hooks/use-mobile';
import EmployeeScheduleView from '@/components/schedule/EmployeeScheduleView';
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
        <EmployeeScheduleView />
      </div>
    </div>
  );
};

export default EmployeeWorkflow;
