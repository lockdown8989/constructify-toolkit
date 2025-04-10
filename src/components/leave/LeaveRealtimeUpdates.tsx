
import React, { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useWebhookNotification } from "@/hooks/leave/useWebhookNotification";
import { sendNotification } from "@/services/NotificationService";

const LeaveRealtimeUpdates: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isManager, isAdmin, isHR } = useAuth();
  const { sendWebhookNotification, getManagerUserIds } = useWebhookNotification();
  
  // Determine if the current user is a manager
  const hasManagerAccess = isManager || isAdmin || isHR;
  
  // Set up real-time listener for leave calendar changes
  useEffect(() => {
    if (!user) return;
    
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
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ['leave_calendar'] });
          
          // Show toast notification for specific events
          if (payload.eventType === 'UPDATE') {
            const newStatus = payload.new.status;
            
            if (newStatus === 'Approved') {
              toast({
                title: "Leave request approved",
                description: "A leave request has been approved.",
              });
              
              // Send in-app notification to the employee
              if (user.id !== payload.new.employee_id) {
                try {
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
              toast({
                title: "Leave request rejected",
                description: "A leave request has been rejected.",
              });
              
              // Send in-app notification to the employee
              if (user.id !== payload.new.employee_id) {
                try {
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
            toast({
              title: "New leave request",
              description: "A new leave request has been submitted.",
            });
            
            // Notify managers or admins about the new request
            if (hasManagerAccess && user.id !== payload.new.employee_id) {
              try {
                const managerIds = await getManagerUserIds();
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
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, toast, user, hasManagerAccess]);
  
  // This component doesn't render anything, it just sets up the listener
  return null;
};

export default LeaveRealtimeUpdates;
