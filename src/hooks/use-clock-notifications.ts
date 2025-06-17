
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEmployeeDataManagement } from '@/hooks/use-employee-data-management';

export const useClockNotifications = () => {
  const { toast } = useToast();
  const { employeeId } = useEmployeeDataManagement();

  useEffect(() => {
    if (!employeeId) return;

    console.log('Setting up clock notifications listener for employee:', employeeId);

    // Set up real-time listener for new clock notifications
    const channel = supabase
      .channel('clock_notification_updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'clock_notifications',
          filter: `employee_id=eq.${employeeId}`
        },
        (payload) => {
          console.log('New clock notification received:', payload);
          const notification = payload.new as any;
          
          // Show toast based on action type
          const getToastIcon = (actionType: string) => {
            switch (actionType) {
              case 'clock_in': return '✅';
              case 'clock_out': return '🏁';
              case 'break_start': return '☕';
              case 'break_end': return '🎯';
              default: return '📢';
            }
          };

          const getToastVariant = (actionType: string) => {
            switch (actionType) {
              case 'clock_in': return 'default';
              case 'clock_out': return 'default';
              case 'break_start': return 'default';
              case 'break_end': return 'default';
              default: return 'default';
            }
          };

          toast({
            title: `${getToastIcon(notification.action_type)} ${notification.action_type.replace('_', ' ').toUpperCase()}`,
            description: notification.message,
            variant: getToastVariant(notification.action_type) as any,
          });
        }
      )
      .subscribe();
    
    console.log('Clock notifications listener subscribed');
    
    return () => {
      console.log('Cleaning up clock notifications listener');
      supabase.removeChannel(channel);
    };
  }, [employeeId, toast]);

  return {};
};
