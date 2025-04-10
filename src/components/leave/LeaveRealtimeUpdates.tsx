import React, { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useWebhookNotification } from "@/hooks/leave/useWebhookNotification";
import { sendNotification } from "@/services/notifications";

const LeaveRealtimeUpdates: React.FC = () => {
  const { toast } = useToast();
  
  // Only access queryClient if we're inside a QueryClientProvider context
  let queryClient;
  try {
    queryClient = useQueryClient();
  } catch (error) {
    console.warn("QueryClient not found in LeaveRealtimeUpdates component. This is expected during first render or outside of QueryClientProvider.");
    // Return null early if no queryClient is available
    return null;
  }
  
  const { user, isManager, isAdmin, isHR } = useAuth();
  const { sendWebhookNotification, getManagerUserIds } = useWebhookNotification();
  
  // Determine if the current user is a manager
  const hasManagerAccess = isManager || isAdmin || isHR;
  
  // Set up real-time listener for leave calendar changes
  useEffect(() => {
    if (!user || !queryClient) {
      console.log('LeaveRealtimeUpdates: No user logged in or no queryClient, skipping setup');
      return;
    }
    
    console.log('LeaveRealtimeUpdates: Setting up realtime updates for user', user.id);
    console.log('LeaveRealtimeUpdates: User has manager access:', hasManagerAccess);
    
    const channel = supabase
      .channel('leave_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leave_calendar'
        },
        async (payload) => {
          console.log('LeaveRealtimeUpdates: Leave calendar update received:', payload);
          
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ['leave-calendar'] });
          
          // Show toast notification for specific events
          if (payload.eventType === 'UPDATE') {
            const newStatus = payload.new.status;
            
            if (newStatus === 'Approved') {
              console.log('LeaveRealtimeUpdates: Leave request approved');
              toast({
                title: "Leave request approved",
                description: "A leave request has been approved.",
              });
              
              // Send in-app notification to the employee
              if (user.id !== payload.new.employee_id) {
                try {
                  console.log('LeaveRealtimeUpdates: Sending notification to employee:', payload.new.employee_id);
                  await sendNotification({
                    user_id: payload.new.employee_id,
                    title: "Leave request approved",
                    message: "Your leave request has been approved.",
                    type: "success",
                    related_entity: "leave_calendar",
                    related_id: payload.new.id
                  });
                  
                  // Send webhook notification if configured
                  await sendWebhookNotification(
                    payload.new.employee_id,
                    'Leave Request Approved',
                    `A leave request for ${payload.new.type} from ${payload.new.start_date} to ${payload.new.end_date} has been approved.`,
                    'leave'
                  );
                } catch (error) {
                  console.error("Error sending notification:", error);
                }
              }
            } else if (newStatus === 'Rejected') {
              console.log('LeaveRealtimeUpdates: Leave request rejected');
              toast({
                title: "Leave request rejected",
                description: "A leave request has been rejected.",
              });
              
              // Send in-app notification to the employee
              if (user.id !== payload.new.employee_id) {
                try {
                  console.log('LeaveRealtimeUpdates: Sending notification to employee:', payload.new.employee_id);
                  await sendNotification({
                    user_id: payload.new.employee_id,
                    title: "Leave request rejected",
                    message: "Your leave request has been rejected.",
                    type: "warning",
                    related_entity: "leave_calendar",
                    related_id: payload.new.id
                  });
                  
                  // Send webhook notification if configured
                  await sendWebhookNotification(
                    payload.new.employee_id,
                    'Leave Request Rejected',
                    `A leave request for ${payload.new.type} from ${payload.new.start_date} to ${payload.new.end_date} has been rejected.`,
                    'leave'
                  );
                } catch (error) {
                  console.error("Error sending notification:", error);
                }
              }
            }
          } else if (payload.eventType === 'INSERT') {
            console.log('LeaveRealtimeUpdates: New leave request submitted');
            toast({
              title: "New leave request",
              description: "A new leave request has been submitted.",
            });
            
            // Notify managers or admins about the new request
            if (hasManagerAccess && user.id !== payload.new.employee_id) {
              try {
                console.log('LeaveRealtimeUpdates: Notifying managers about new leave request');
                const managerIds = await getManagerUserIds();
                console.log('LeaveRealtimeUpdates: Found manager IDs:', managerIds);
                
                for (const managerId of managerIds) {
                  await sendNotification({
                    user_id: managerId,
                    title: "New leave request",
                    message: "A new leave request requires your review.",
                    type: "info",
                    related_entity: "leave_calendar",
                    related_id: payload.new.id
                  });
                  
                  // Send webhook notification if configured
                  await sendWebhookNotification(
                    managerId,
                    'New Leave Request',
                    `A new leave request has been submitted for ${payload.new.type} from ${payload.new.start_date} to ${payload.new.end_date}.`,
                    'leave'
                  );
                }
              } catch (error) {
                console.error("Error sending notifications to managers:", error);
              }
            }
          }
        }
      )
      .subscribe();
    
    console.log('LeaveRealtimeUpdates: Subscribed to leave_updates channel');
    
    return () => {
      console.log('LeaveRealtimeUpdates: Cleaning up channel subscription');
      supabase.removeChannel(channel);
    };
  }, [queryClient, toast, user, hasManagerAccess, sendWebhookNotification, getManagerUserIds]);
  
  // This component doesn't render anything, it just sets up the listener
  return null;
};

export default LeaveRealtimeUpdates;
