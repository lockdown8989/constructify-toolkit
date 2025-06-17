
import { useEffect } from 'react';

export const useAutoRefresh = (
  schedulesLoading: boolean,
  employeesLoading: boolean,
  refetchSchedules: () => Promise<any>
) => {
  useEffect(() => {
    const interval = setInterval(() => {
      if (!schedulesLoading && !employeesLoading) {
        refetchSchedules();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [schedulesLoading, employeesLoading, refetchSchedules]);
};
