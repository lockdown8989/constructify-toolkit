
import { useState, useEffect } from 'react';
import { useSchedules } from '@/hooks/use-schedules';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';

export const useEmployeeSchedule = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("my-shifts");
  const [newSchedules, setNewSchedules] = useState<Record<string, boolean>>({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Fetch schedules with the refresh trigger
  const { data: schedules = [], isLoading } = useSchedules();
  
  // Function to manually refresh schedules
  const refreshSchedules = () => {
    setRefreshTrigger(prev => prev + 1);
    toast({
      title: "Refreshing shifts",
      description: "Your schedule is being updated...",
    });
  };
  
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

  // Subscribe to realtime updates for new schedules
  useEffect(() => {
    if (!user) return;
    
    // Get employee ID for the current user
    const getEmployeeId = async () => {
      try {
        const { data: employee } = await supabase
          .from('employees')
          .select('id')
          .eq('user_id', user.id)
          .single();
          
        if (employee) {
          // Set up realtime subscription for this employee's schedules
          const channel = supabase
            .channel('schedule_updates')
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: 'public',
                table: 'schedules',
                filter: `employee_id=eq.${employee.id}`
              },
              (payload) => {
                console.log('Schedule change detected:', payload);
                refreshSchedules();
                
                if (payload.eventType === 'INSERT') {
                  toast({
                    title: "New shift assigned",
                    description: "You have been assigned a new shift.",
                  });
                } else if (payload.eventType === 'UPDATE') {
                  toast({
                    title: "Shift updated",
                    description: "One of your shifts has been updated.",
                  });
                }
              }
            )
            .subscribe();
            
          console.log('Subscribed to schedule updates for employee:', employee.id);
          return () => { supabase.removeChannel(channel); };
        }
      } catch (error) {
        console.error('Error setting up realtime subscription:', error);
      }
    };
    
    getEmployeeId();
  }, [user, toast]);

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
    isLoading,
    refreshSchedules
  };
};
