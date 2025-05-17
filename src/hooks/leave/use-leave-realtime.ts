
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '../use-toast';
import { useAuth } from '../use-auth';

export function useLeaveRealtime() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user) return;
    
    console.log('Setting up leave realtime subscription for user:', user.id);
    
    // Set up subscription for leave_calendar changes
    const leaveChannel = supabase
      .channel('leave_calendar_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'leave_calendar' 
        }, 
        (payload) => {
          console.log('Leave calendar update detected:', payload);
          
          // Invalidate relevant queries to refresh the data
          queryClient.invalidateQueries({ queryKey: ['employee-leave'] });
          queryClient.invalidateQueries({ queryKey: ['leave-calendar'] });
          
          if (payload.eventType === 'INSERT') {
            toast({
              title: 'New leave request',
              description: 'A new leave request has been added',
              variant: 'default',
            });
          } else if (payload.eventType === 'UPDATE') {
            toast({
              title: 'Leave request updated',
              description: `Leave status changed to ${payload.new.status}`,
              variant: payload.new.status === 'Approved' ? 'default' : 'destructive',
            });
          }
        }
      )
      .subscribe();
      
    // Set up subscription for employee table changes (leave days allocation)
    const employeeChannel = supabase
      .channel('employee_changes')
      .on('postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'employees',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Employee data updated:', payload);
          
          // Check if leave related fields were updated
          if (payload.new.annual_leave_days !== payload.old.annual_leave_days ||
              payload.new.sick_leave_days !== payload.old.sick_leave_days) {
            
            // Invalidate employee leave query to refresh the data
            queryClient.invalidateQueries({ queryKey: ['employee-leave'] });
            
            toast({
              title: 'Leave allocation updated',
              description: 'Your leave days have been updated',
              variant: 'default',
            });
          }
        }
      )
      .subscribe();
    
    // Clean up subscriptions on unmount
    return () => {
      supabase.removeChannel(leaveChannel);
      supabase.removeChannel(employeeChannel);
    };
  }, [queryClient, toast, user]);
}
