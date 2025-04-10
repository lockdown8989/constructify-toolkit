
import React, { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const RealtimeUpdates: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
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
          queryClient.invalidateQueries({ queryKey: ['leave_calendar'] });
          
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
  
  return null;
};

export default RealtimeUpdates;
