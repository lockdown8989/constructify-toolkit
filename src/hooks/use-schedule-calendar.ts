
import { useState, useEffect } from 'react';
import { Schedule } from '@/hooks/use-schedules';

export function useScheduleCalendar(schedules: Schedule[]) {
  const [newSchedules, setNewSchedules] = useState<Record<string, boolean>>({});
  const [pendingSchedules, setPendingSchedules] = useState<Schedule[]>([]);
  
  // Identify new and pending schedules
  useEffect(() => {
    if (!schedules.length) return;
    
    const now = new Date();
    
    // Find recent schedules (within the last 24 hours)
    const recentSchedules = schedules.filter(schedule => {
      const createdAt = new Date(schedule.created_at || schedule.start_time);
      const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
      return hoursSinceCreation < 24;
    });
    
    // Find pending schedules
    const pendingSchedulesList = schedules.filter(schedule => 
      schedule.status === 'pending'
    );
    
    setNewSchedules(recentSchedules.reduce((acc, schedule) => {
      acc[schedule.id] = true;
      return acc;
    }, {} as Record<string, boolean>));
    
    setPendingSchedules(pendingSchedulesList);
  }, [schedules]);
  
  return {
    newSchedules,
    pendingSchedules
  };
}
