
import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useIsMobile } from '@/hooks/use-mobile';
import ManagerScheduleViewWithHeatmap from '@/components/schedule/ManagerScheduleViewWithHeatmap';
import EmployeeScheduleView from '@/components/schedule/EmployeeScheduleView';

const Schedule: React.FC = () => {
  const { isAdmin, isManager, isHR } = useAuth();
  const isMobile = useIsMobile();
  const hasManagerAccess = isAdmin || isManager || isHR;

  return (
    <div className={`${isMobile ? 'px-0 py-2' : 'container py-6'}`}>
      {hasManagerAccess ? (
        <ManagerScheduleViewWithHeatmap />
      ) : (
        <EmployeeScheduleView />
      )}
    </div>
  );
};

export default Schedule;
