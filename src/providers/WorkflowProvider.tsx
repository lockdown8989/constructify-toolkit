
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { WorkflowNotification } from '@/types/supabase';

type WorkflowContextType = {
  lastNotification: WorkflowNotification | null;
};

const WorkflowContext = createContext<WorkflowContextType>({
  lastNotification: null,
});

export const useWorkflow = () => useContext(WorkflowContext);

export const WorkflowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [lastNotification, setLastNotification] = useState<WorkflowNotification | null>(null);

  useEffect(() => {
    if (!user) return;

    console.log('Setting up workflow realtime subscription for user', user.id);

    // Subscribe to realtime notifications
    const channel = supabase
      .channel('workflow-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'workflow_notifications',
          filter: `receiver_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New workflow notification received:', payload);
          
          // Update the query cache
          queryClient.invalidateQueries({ queryKey: ['workflow-notifications'] });
          queryClient.invalidateQueries({ queryKey: ['workflow-notifications-unread'] });
          
          // Set the last notification for context consumers
          const notification = payload.new as WorkflowNotification;
          setLastNotification(notification);
          
          // Show a toast notification
          toast({
            title: notification.type,
            description: notification.message,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workflow_requests',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Workflow request updated:', payload);
          
          // Update the query cache
          queryClient.invalidateQueries({ queryKey: ['workflow-requests-user'] });
          
          if (payload.eventType === 'UPDATE') {
            // Show a toast notification for status changes
            toast({
              title: 'Request Updated',
              description: `Your request has been ${payload.new.status}.`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up workflow realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [user, queryClient, toast]);

  return (
    <WorkflowContext.Provider value={{ lastNotification }}>
      {children}
    </WorkflowContext.Provider>
  );
};
