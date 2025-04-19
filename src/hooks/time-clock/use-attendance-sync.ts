
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
          
          // If a new record was inserted or a record was updated
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            // Perform sync callback to refresh attendance data
            onSync();
            
            // Show toast for certain updates
            if (payload.eventType === 'UPDATE' && payload.new?.status === 'Auto-logout') {
              toast({
                title: "Auto Clock-Out Detected",
                description: "You were automatically clocked out from another device or session.",
              });
            }
          }
        }
      )
      .subscribe();
    
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
          // Track online status
          await presenceChannel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
            employee_id: user.id
          });
        }
      });
    
    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(presenceChannel);
    };
  }, [user, onSync, toast]);
};
