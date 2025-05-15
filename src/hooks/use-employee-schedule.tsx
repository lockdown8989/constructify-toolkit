
import { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface EmployeeSchedule {
  id: string;
  title: string;
  employee_id: string;
  start_time: string;
  end_time: string;
  status: string;
  created_at: string;
  location?: string;
  updated_at?: string;
  mobile_notification_sent: boolean;
  created_platform: string;
  last_modified_platform: string;
}

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
  
  // In a real app, this would fetch from an API/database
  const fetchSchedules = async (): Promise<EmployeeSchedule[]> => {
    // This is mock data - in a real app, you'd fetch from Supabase or another backend
    return [
      {
        id: "1",
        title: "Morning Shift",
        employee_id: user?.id || "",
        start_time: "2025-05-16T08:00:00",
        end_time: "2025-05-16T16:00:00",
        status: "confirmed",
        created_at: "2025-05-10T10:00:00",
        location: "Main Office",
        updated_at: "2025-05-10T10:00:00",
        mobile_notification_sent: false,
        created_platform: "web",
        last_modified_platform: "web"
      },
      {
        id: "2",
        title: "Evening Shift",
        employee_id: user?.id || "",
        start_time: "2025-05-18T16:00:00",
        end_time: "2025-05-18T23:00:00",
        status: "confirmed",
        created_at: "2025-05-10T10:00:00",
        location: "Main Office",
        updated_at: "2025-05-10T10:00:00",
        mobile_notification_sent: false,
        created_platform: "web",
        last_modified_platform: "web"
      },
      {
        id: "3",
        title: "Staff Meeting",
        employee_id: user?.id || "",
        start_time: "2025-05-20T14:00:00",
        end_time: "2025-05-20T15:30:00",
        status: "confirmed",
        created_at: "2025-05-10T10:00:00",
        location: "Conference Room",
        updated_at: "2025-05-10T10:00:00",
        mobile_notification_sent: false,
        created_platform: "web",
        last_modified_platform: "web"
      }
    ];
  };
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['employeeSchedules', user?.id, refreshTrigger],
    queryFn: fetchSchedules,
    enabled: !!user?.id
  });
  
  // Function to manually refresh schedules
  const refreshSchedules = () => {
    console.log('Manually refreshing schedules...');
    setRefreshTrigger(prev => prev + 1);
  };
  
  const refetch = refreshSchedules;
  
  // Track new schedules (created in the last 24 hours) and set initial tab
  useEffect(() => {
    if (!data) return;
    
    console.log('Processing schedules for tabs, count:', data.length);
    
    // Debug schedules data
    data.forEach(schedule => {
      console.log(`Schedule ${schedule.id}: status=${schedule.status}, start_time=${schedule.start_time}`);
    });
    
    const now = new Date();
    const newScheduleIds: Record<string, boolean> = {};
    
    data.forEach(schedule => {
      const createdAt = new Date(schedule.created_at || schedule.start_time);
      const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
      if (hoursSinceCreation < 24) {
        newScheduleIds[schedule.id] = true;
      }
    });
    
    setNewSchedules(newScheduleIds);
    
    // Check for pending shifts
    const pendingShifts = data.filter(schedule => schedule.status === 'pending');
    console.log('Found pending shifts:', pendingShifts.length);
    
    // Show pending tab if there are pending shifts
    if (pendingShifts.length > 0) {
      setActiveTab('pending');
      
      // Show a toast notification if there are pending shifts
      toast({
        title: `${pendingShifts.length} pending shift${pendingShifts.length > 1 ? 's' : ''} waiting`,
        description: "You have shifts that require your response.",
      });
    }
  }, [data, toast]);

  // Subscribe to realtime updates for new schedules
  useEffect(() => {
    if (!user) return;
    
    console.log('Setting up realtime subscription for user:', user.id);
    
    // Get employee ID for the current user
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
                refreshSchedules();
                
                if (payload.eventType === 'INSERT') {
                  const newSchedule = payload.new as any;
                  
                  // Check if it's a pending shift and switch to pending tab
                  if (newSchedule.status === 'pending') {
                    setActiveTab('pending');
                    toast({
                      title: "New shift requires response",
                      description: "You have a new shift request waiting for your response.",
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
            .subscribe();
            
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
    schedules: data || [],
    isLoading,
    error,
    refreshSchedules,
    refetch
  };
};
