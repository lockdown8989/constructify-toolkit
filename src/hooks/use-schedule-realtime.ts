
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { sendNotification } from '@/services/notifications';
import { getManagerUserIds } from '@/services/notifications/role-utils';

export const useScheduleRealtime = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user) return;
    
    const channel = supabase
      .channel('schedule_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shift_swaps'
        },
        async (payload) => {
          console.log('Shift swap change detected:', payload);
          queryClient.invalidateQueries({ queryKey: ['shift_swaps'] });
          queryClient.invalidateQueries({ queryKey: ['shift-swaps'] });
          queryClient.invalidateQueries({ queryKey: ['schedules'] }); // Also refresh schedules
          
          const { data: pendingShifts } = await supabase
            .from('shift_swaps')
            .select('id', { count: 'exact' })
            .eq('status', 'Pending');
            
          if (payload.eventType === 'UPDATE') {
            const newStatus = payload.new.status;
            const oldStatus = payload.old.status;
            
            if (oldStatus === 'Pending' && newStatus === 'Approved') {
              toast({
                title: "Shift swap approved",
                description: "A shift swap request has been approved.",
              });
              
              // Refresh schedules to reflect the changes in the calendar
              queryClient.invalidateQueries({ queryKey: ['schedules'] });
            } else if (oldStatus === 'Pending' && newStatus === 'Rejected') {
              toast({
                title: "Shift swap rejected",
                description: "A shift swap request has been rejected.",
              });
            } else if (newStatus === 'Completed') {
              toast({
                title: "Shift swap completed",
                description: "The shift swap has been completed and is now reflected in the schedule.",
              });
              
              // Refresh schedules to reflect the changes in the calendar
              queryClient.invalidateQueries({ queryKey: ['schedules'] });
            }
          } else if (payload.eventType === 'INSERT') {
            toast({
              title: "New shift swap request",
              description: "A new shift swap request has been submitted.",
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'availability_requests'
        },
        async (payload) => {
          queryClient.invalidateQueries({ queryKey: ['availability_requests'] });
          
          const { data: pendingAvailability } = await supabase
            .from('availability_requests')
            .select('id', { count: 'exact' })
            .eq('status', 'Pending');
          
          if (payload.eventType === 'UPDATE') {
            const newStatus = payload.new.status;
            const oldStatus = payload.old.status;
            
            if (oldStatus === 'Pending' && newStatus === 'Approved') {
              toast({
                title: "Availability request approved",
                description: "An availability request has been approved.",
              });
              
              if (payload.new.employee_id && user.id !== payload.new.employee_id) {
                await sendNotification({
                  user_id: payload.new.employee_id,
                  title: "Availability request approved",
                  message: "Your availability request has been approved.",
                  type: "success",
                  related_entity: "availability_requests",
                  related_id: payload.new.id
                });
              }
            } else if (oldStatus === 'Pending' && newStatus === 'Rejected') {
              toast({
                title: "Availability request rejected",
                description: "An availability request has been rejected.",
              });
              
              if (payload.new.employee_id && user.id !== payload.new.employee_id) {
                await sendNotification({
                  user_id: payload.new.employee_id,
                  title: "Availability request rejected",
                  message: "Your availability request has been rejected.",
                  type: "warning",
                  related_entity: "availability_requests",
                  related_id: payload.new.id
                });
              }
            }
          } else if (payload.eventType === 'INSERT') {
            toast({
              title: "New availability request",
              description: "A new availability request has been submitted.",
            });
            
            const managerIds = await getManagerUserIds();
            
            for (const managerId of managerIds) {
              if (managerId !== user.id) {
                await sendNotification({
                  user_id: managerId,
                  title: "New availability request",
                  message: "A new availability request requires your review.",
                  type: "info",
                  related_entity: "availability_requests",
                  related_id: payload.new.id
                });
              }
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'schedules'
        },
        async (payload) => {
          console.log('Schedule change detected:', payload);
          queryClient.invalidateQueries({ queryKey: ['schedules'] });
          
          if (payload.eventType === 'UPDATE' && payload.old.employee_id !== payload.new.employee_id) {
            toast({
              title: "Schedule updated",
              description: "A shift has been reassigned to a different employee.",
            });
          }
          
          // Log manager-initiated calendar actions
          if (payload.eventType === 'INSERT') {
            const isManager = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', user.id)
              .in('role', ['admin', 'employer', 'hr'])
              .maybeSingle();
              
            if (isManager?.data) {
              // Record calendar action
              await supabase.from('calendar_actions').insert({
                action_type: 'add_shift',
                date: payload.new.start_time,
                initiator_id: user.id,
                details: {
                  shift_id: payload.new.id,
                  employee_id: payload.new.employee_id,
                  title: payload.new.title
                }
              });
            }
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, toast, user]);
};
