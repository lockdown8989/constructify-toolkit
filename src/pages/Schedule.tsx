
import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import ManagerScheduleView from '@/components/schedule/ManagerScheduleView';
import EmployeeWorkflow from '@/pages/EmployeeWorkflow';

const Schedule: React.FC = () => {
  const { isAdmin, isManager, isHR } = useAuth();
  const hasManagerAccess = isAdmin || isManager || isHR;

  return (
    <div className="container py-6">
      {hasManagerAccess ? (
        <ManagerScheduleView />
      ) : (
        <EmployeeWorkflow />
      )}
    </div>
  );
};

export default Schedule;
