
import { useScheduleQueries } from './use-schedule-queries';
import { useCreateSchedule, useUpdateSchedule } from './use-schedule-mutations';
import { useScheduleRealtime } from './use-schedule-realtime';
import { Schedule } from '@/types/schedule.types';

export { Schedule };

export function useSchedules() {
  const query = useScheduleQueries();
  useScheduleRealtime();

  return query;
}

export { useCreateSchedule, useUpdateSchedule };
