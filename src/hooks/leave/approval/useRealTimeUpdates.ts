
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

// Hook to handle real-time updates for leave requests
export const useRealTimeUpdates = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  useEffect(() => {
    const channel = supabase
      .channel('leave_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leave_calendar'
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['leave-calendar'] });
          
          if (payload.eventType === 'UPDATE') {
            const newStatus = payload.new.status;
            const oldStatus = payload.old.status;
            
            if (oldStatus === 'Pending' && newStatus === 'Approved') {
              toast({
                title: "Leave request approved",
                description: "A leave request has been approved.",
              });
            } else if (oldStatus === 'Pending' && newStatus === 'Rejected') {
              toast({
                title: "Leave request rejected",
                description: "A leave request has been rejected.",
              });
            }
          } else if (payload.eventType === 'INSERT') {
            toast({
              title: "New leave request",
              description: "A new leave request has been submitted.",
            });
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, toast]);
};
