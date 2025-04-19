
import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth';
import { useToast } from '@/hooks/use-toast';

export function useScheduleRealtime() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  React.useEffect(() => {
    if (!user) return;

    console.log('Setting up realtime subscription for schedules');
    
    const channel = supabase
      .channel('schedule_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'schedules'
        },
        async (payload) => {
          console.log('Received realtime update:', payload);
          
          if (payload.eventType === 'UPDATE') {
            const schedule = payload.new;
            toast({
              title: 'Schedule Updated',
              description: `The schedule for ${new Date(schedule.start_time).toLocaleDateString()} has been updated.`,
            });
          } else if (payload.eventType === 'INSERT') {
            toast({
              title: 'New Schedule',
              description: 'A new schedule has been assigned.',
            });
          }
          
          await queryClient.invalidateQueries({ queryKey: ['schedules'] });
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    return () => {
      console.log('Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [user, queryClient, toast]);
}
