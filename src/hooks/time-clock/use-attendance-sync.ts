
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

type SyncCallback = () => void;

export const useAttendanceSync = (onSync: SyncCallback) => {
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    console.log('Setting up real-time attendance sync for user:', user.id);

    // Subscribe to attendance changes for the current user
    const channel = supabase
      .channel('attendance_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance',
          filter: `employee_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Attendance record changed:', payload);
          console.log('Change detected at device time:', new Date().toLocaleString());
          
          // Call the sync callback whenever an attendance record changes
          onSync();
          
          // Show toast for certain updates
          if (payload.eventType === 'UPDATE') {
            if (payload.new?.status === 'Auto-logout') {
              toast({
                title: "Auto Clock-Out Detected",
                description: "You were automatically clocked out from another device or session.",
              });
            } else if (payload.new?.active_session === false && payload.old?.active_session === true) {
              toast({
                title: "Status Updated",
                description: "Your clock-out was registered.",
              });
            } else if (payload.new?.active_session === true && payload.old?.active_session === false) {
              toast({
                title: "Status Updated",
                description: "Your clock-in was registered.",
              });
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('Attendance channel subscription status:', status);
      });
    
    // Set online presence for the employee
    const presenceChannel = supabase.channel('online_employees');
    
    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = presenceChannel.presenceState();
        console.log('Current online employees:', presenceState);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('New employee online:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('Employee went offline:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track online status with current device time
          await presenceChannel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
            employee_id: user.id,
            device_time: new Date().toLocaleString()
          });
        }
      });
    
    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(presenceChannel);
    };
  }, [user, onSync, toast]);
};
