
import { useState, useEffect } from 'react';
import { useSchedules } from '@/hooks/use-schedules';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export const useEmployeeSchedule = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("calendar");
  const [newSchedules, setNewSchedules] = useState<Record<string, boolean>>({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Function to navigate to full schedule view
  const viewFullSchedule = () => {
    navigate('/shift-calendar');
  };
  
  // Fetch schedules with the refresh trigger
  const { data: schedules = [], isLoading, refetch } = useSchedules();
  
  // Function to manually refresh schedules
  const refreshSchedules = () => {
    console.log('Manually refreshing schedules...');
    setRefreshTrigger(prev => prev + 1);
    refetch();
    toast({
      title: "Refreshing shifts",
      description: "Your schedule is being updated...",
    });
  };
  
  // Track new schedules (created in the last 24 hours) and set initial tab
  useEffect(() => {
    console.log('Processing schedules for tabs, count:', schedules.length);
    
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
    
    // Check for pending shifts
    const pendingShifts = schedules.filter(schedule => schedule.status === 'pending');
    console.log('Found pending shifts:', pendingShifts.length);
    
    // Show calendar tab by default, but show notification for pending shifts
    if (pendingShifts.length > 0 && activeTab === 'calendar') {
      toast({
        title: `${pendingShifts.length} pending shift${pendingShifts.length > 1 ? 's' : ''} waiting`,
        description: "You have shifts that require your response.",
        duration: 5000,
      });
    }
  }, [schedules, toast, activeTab]);

  // Subscribe to realtime updates for new schedules with improved error handling
  useEffect(() => {
    if (!user) return;
    
    console.log('Setting up realtime subscription for user:', user.id);
    
    const getEmployeeId = async () => {
      try {
        const { data: employee } = await supabase
          .from('employees')
          .select('id')
          .eq('user_id', user.id)
          .single();
          
        if (employee) {
          console.log('Found employee ID for subscription:', employee.id);
          
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
                
                // Debounce refresh calls
                setTimeout(() => {
                  refreshSchedules();
                }, 500);
                
                if (payload.eventType === 'INSERT') {
                  const newSchedule = payload.new as any;
                  
                  if (newSchedule.status === 'pending') {
                    // Don't auto-switch tabs, just notify
                    toast({
                      title: "New shift requires response",
                      description: "You have a new shift request waiting for your response.",
                      duration: 5000,
                    });
                  } else {
                    toast({
                      title: "New shift assigned",
                      description: "You have been assigned a new shift.",
                    });
                  }
                } else if (payload.eventType === 'UPDATE') {
                  toast({
                    title: "Shift updated",
                    description: "One of your shifts has been updated.",
                  });
                }
              }
            )
            .subscribe((status) => {
              console.log('Realtime subscription status:', status);
            });
            
          console.log('Subscribed to schedule updates for employee:', employee.id);
          return () => { supabase.removeChannel(channel); };
        } else {
          console.log('No employee record found for current user');
        }
      } catch (error) {
        console.error('Error setting up realtime subscription:', error);
      }
    };
    
    getEmployeeId();
  }, [user, toast]);

  // Auto-refresh schedules every 30 seconds for better synchronization
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading) {
        console.log('Auto-refreshing schedules...');
        refetch();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [isLoading, refetch]);

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
    refreshSchedules,
    refetch,
    viewFullSchedule
  };
};
