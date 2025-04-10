import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LeaveRequestForm from "@/components/leave/LeaveRequestForm";
import LeaveApprovalDashboard from "@/components/leave/LeaveApprovalDashboard";
import EnhancedCalendarView from "@/components/leave/EnhancedCalendarView";
import WebhookConfig from "@/components/notifications/WebhookConfig";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useEmployees } from "@/hooks/use-employees";
import { useAuth } from "@/hooks/use-auth";
import { sendNotification } from "@/services/NotificationService";

const LeaveManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isManager, isAdmin, isHR } = useAuth();
  
  // Get employees data to determine user role
  const { data: employees = [] } = useEmployees();
  
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
  
  // Function to get manager user IDs
  const getManagerUserIds = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'manager');
      
      if (error) throw error;
      return data.map(item => item.user_id);
    } catch (error) {
      console.error("Error fetching manager IDs:", error);
      return [];
    }
  };
  
  // Function to send webhook notifications
  const sendWebhookNotification = async (userId: string, title: string, message: string, notificationType: string) => {
    try {
      // Get user's webhook settings
      const { data, error } = await supabase
        .from('webhook_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) throw error;
      
      // If no webhook is configured or the notification type is disabled, skip
      if (!data || !data.webhook_url) return;
      
      // Check if this notification type is enabled
      let isEnabled = false;
      if (notificationType === 'shift_swaps' && data.notify_shift_swaps) isEnabled = true;
      if (notificationType === 'availability' && data.notify_availability) isEnabled = true;
      if (notificationType === 'leave' && data.notify_leave) isEnabled = true;
      if (notificationType === 'attendance' && data.notify_attendance) isEnabled = true;
      
      if (!isEnabled) return;
      
      // Send webhook notification
      await supabase.functions.invoke('send-webhook', {
        body: {
          webhookType: data.webhook_type,
          webhookUrl: data.webhook_url,
          title,
          message,
          data: {
            type: notificationType,
            timestamp: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      console.error('Error sending webhook notification:', error);
    }
  };
  
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Leave Management</h1>
      
      <Tabs defaultValue="employee">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="employee">Employee View</TabsTrigger>
          <TabsTrigger value="manager" disabled={!hasManagerAccess}>Manager View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="notifications" disabled={!hasManagerAccess}>Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="employee" className="space-y-4">
          <div className="max-w-md mx-auto">
            <LeaveRequestForm />
          </div>
        </TabsContent>
        
        <TabsContent value="manager">
          {hasManagerAccess ? (
            <LeaveApprovalDashboard />
          ) : (
            <div className="text-center p-8 text-muted-foreground">
              You don't have permission to access this view.
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="calendar">
          <EnhancedCalendarView />
        </TabsContent>
        
        <TabsContent value="notifications">
          {hasManagerAccess ? (
            <div className="max-w-xl mx-auto">
              <WebhookConfig />
            </div>
          ) : (
            <div className="text-center p-8 text-muted-foreground">
              You don't have permission to access this view.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeaveManagement;
