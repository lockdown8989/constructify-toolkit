
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

export const useAttendanceSync = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    // Set up real-time subscription for attendance changes
    const channel = supabase
      .channel('attendance-sync')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance',
          filter: `employee_id=eq.${user.id}`
        },
        async (payload) => {
          console.log('Attendance change detected:', payload);
          
          // Invalidate both attendance and statistics queries to trigger refresh
          await queryClient.invalidateQueries({ queryKey: ['attendance'] });
          await queryClient.invalidateQueries({ queryKey: ['employee-statistics'] });
          
          if (payload.eventType === 'UPDATE') {
            toast({
              title: "Attendance Updated",
              description: "Your attendance record has been synchronized.",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient, toast]);
};

