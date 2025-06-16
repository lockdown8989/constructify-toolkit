
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

export const useAttendanceSync = () => {
  const { user, isManager } = useAuth();
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
          table: 'attendance'
        },
        async (payload) => {
          console.log('Attendance change detected:', payload);
          
          // For managers, invalidate all attendance-related queries
          if (isManager) {
            await queryClient.invalidateQueries({ queryKey: ['attendance'] });
            await queryClient.invalidateQueries({ queryKey: ['employee-statistics'] });
            await queryClient.invalidateQueries({ queryKey: ['employee-status'] });
          } else {
            // For employees, only invalidate their own data
            if (payload.new?.employee_id === user.id || payload.old?.employee_id === user.id) {
              await queryClient.invalidateQueries({ queryKey: ['attendance', user.id] });
              await queryClient.invalidateQueries({ queryKey: ['employee-statistics', user.id] });
            }
          }
          
          if (payload.eventType === 'UPDATE') {
            toast({
              title: "Attendance Updated",
              description: "Attendance record has been synchronized.",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isManager, queryClient, toast]);
};
