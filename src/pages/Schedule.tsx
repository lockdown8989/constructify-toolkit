
import React from 'react';
import { useAuth } from '@/hooks/auth';
import { useIsMobile } from '@/hooks/use-mobile';
import ManagerScheduleView from '@/components/schedule/ManagerScheduleView';
import EmployeeScheduleView from '@/components/schedule/EmployeeScheduleView';

const Schedule: React.FC = () => {
  const { isAdmin, isManager, isHR } = useAuth();
  const isMobile = useIsMobile();
  const hasManagerAccess = isAdmin || isManager || isHR;

  return (
    <div className={`${isMobile ? 'px-0 py-2' : 'container py-6'}`}>
      {hasManagerAccess ? (
        <ManagerScheduleView />
      ) : (
        <EmployeeScheduleView />
      )}
    </div>
  );
};

export default Schedule;
