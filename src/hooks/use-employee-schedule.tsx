
import { useState, useEffect } from 'react';
import { useSchedules } from '@/hooks/use-schedules';

export const useEmployeeSchedule = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("my-shifts");
  const [newSchedules, setNewSchedules] = useState<Record<string, boolean>>({});
  
  const { data: schedules = [], isLoading } = useSchedules();
  
  // Track new schedules (created in the last 24 hours)
  useEffect(() => {
    const now = new Date();
    const newScheduleIds: Record<string, boolean> = {};
    
    schedules.forEach(schedule => {
      const createdAt = new Date(schedule.created_at || schedule.start_time);
      const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
      if (hoursSinceCreation < 24) {
        newScheduleIds[schedule.id] = true;
      }
    });
    
    setNewSchedules(newScheduleIds);
  }, [schedules]);

  return {
    currentDate,
    setCurrentDate,
    selectedScheduleId,
    setSelectedScheduleId,
    isInfoDialogOpen,
    setIsInfoDialogOpen,
    isCancelDialogOpen,
    setIsCancelDialogOpen,
    activeTab,
    setActiveTab,
    newSchedules,
    schedules,
    isLoading
  };
};
