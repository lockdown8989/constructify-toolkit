
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useWebhookNotification } from "@/hooks/leave/useWebhookNotification";
import { sendNotification } from "@/services/notifications";
import { getManagerUserIds } from "@/services/notifications/role-utils";

export const useLeaveRealtime = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isManager, isAdmin, isHR } = useAuth();
  const { sendWebhookNotification } = useWebhookNotification();
  
  const hasManagerAccess = isManager || isAdmin || isHR;
  
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
          
          // Invalidate queries to refresh data - both manager and employee views
          queryClient.invalidateQueries({ queryKey: ['leave-calendar'] });
          queryClient.invalidateQueries({ queryKey: ['employee-leave-requests'] });
          
          if (payload.eventType === 'UPDATE') {
            await handleLeaveUpdate(payload, user.id, hasManagerAccess, toast, sendWebhookNotification);
          } else if (payload.eventType === 'INSERT') {
            await handleLeaveInsert(payload, user.id, hasManagerAccess, toast, sendWebhookNotification);
          }
        }
      )
      .subscribe((status) => {
        console.log('LeaveRealtimeUpdates: Subscription status:', status);
      });
    
    console.log('LeaveRealtimeUpdates: Subscribed to leave_updates channel');
    
    return () => {
      console.log('LeaveRealtimeUpdates: Cleaning up channel subscription');
      supabase.removeChannel(channel);
    };
  }, [queryClient, toast, user, hasManagerAccess, sendWebhookNotification]);
};

// Helper functions
const handleLeaveUpdate = async (
  payload: any,
  userId: string,
  hasManagerAccess: boolean,
  toast: any,
  sendWebhookNotification: (userId: string, title: string, message: string, notificationType: string) => Promise<void>
) => {
  const newStatus = payload.new.status;
  const oldStatus = payload.old.status;
  
  if (oldStatus === 'Pending') {
    await handleStatusChange(payload, userId, hasManagerAccess, toast, newStatus, sendWebhookNotification);
  }
};

const handleLeaveInsert = async (
  payload: any,
  userId: string,
  hasManagerAccess: boolean,
  toast: any,
  sendWebhookNotification: (userId: string, title: string, message: string, notificationType: string) => Promise<void>
) => {
  // Only show toast for other users' requests if user is a manager
  if (hasManagerAccess || userId === payload.new.employee_id) {
    toast({
      title: "New leave request",
      description: "A new leave request has been submitted.",
    });
  }
  
  // If current user is manager, notify them about the new request
  if (hasManagerAccess) {
    await notifyManagersAboutNewRequest(payload);
  }
};

const handleStatusChange = async (
  payload: any,
  userId: string,
  hasManagerAccess: boolean,
  toast: any,
  newStatus: string,
  sendWebhookNotification: (userId: string, title: string, message: string, notificationType: string) => Promise<void>
) => {
  const isYourRequest = userId === payload.new.employee_id;
  
  if ((isYourRequest || hasManagerAccess)) {
    if (newStatus === 'Approved') {
      showStatusChangeToast(toast, isYourRequest, payload.new, 'approved');
      await sendEmployeeNotification(payload.new, 'Approved', sendWebhookNotification);
    } else if (newStatus === 'Rejected') {
      showStatusChangeToast(toast, isYourRequest, payload.new, 'rejected');
      await sendEmployeeNotification(payload.new, 'Rejected', sendWebhookNotification);
    }
  }
};

const showStatusChangeToast = (
  toast: any,
  isYourRequest: boolean,
  leaveData: any,
  status: string
) => {
  toast({
    title: isYourRequest ? `Your leave request ${status}` : `Leave request ${status}`,
    description: isYourRequest 
      ? `Your leave request from ${leaveData.start_date} to ${leaveData.end_date} has been ${status}.`
      : "A leave request has been " + status + ".",
  });
};

const sendEmployeeNotification = async (
  leaveData: any, 
  status: 'Approved' | 'Rejected',
  sendWebhookNotification: (userId: string, title: string, message: string, notificationType: string) => Promise<void>
) => {
  if (!leaveData.employee_id) return;
  
  try {
    // Get employee data
    const { data: employeeData } = await supabase
      .from('employees')
      .select('name, department')
      .eq('id', leaveData.employee_id)
      .single();
    
    if (employeeData) {
      await sendNotification({
        user_id: leaveData.employee_id,
        title: `Leave Request ${status}`,
        message: `Your leave request from ${leaveData.start_date} to ${leaveData.end_date} has been ${status.toLowerCase()}.`,
        type: status === 'Approved' ? 'success' : 'warning',
        related_entity: 'leave_calendar',
        related_id: leaveData.id
      });
      
      // Send webhook notification
      await sendWebhookNotification(
        leaveData.employee_id,
        `Leave Request ${status}`,
        `A leave request for ${leaveData.type} from ${leaveData.start_date} to ${leaveData.end_date} has been ${status.toLowerCase()}.`,
        'leave'
      );
    }
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

const notifyManagersAboutNewRequest = async (payload: any) => {
  try {
    console.log('LeaveRealtimeUpdates: Manager user detected, force refreshing leave data');
    
    // Get all managers to notify them about the new leave request
    const managerIds = await getManagerUserIds();
    console.log('LeaveRealtimeUpdates: Found manager IDs:', managerIds);
    
    // Get employee name for notification
    const { data: employeeData } = await supabase
      .from('employees')
      .select('name, department')
      .eq('id', payload.new.employee_id)
      .single();
    
    const employeeName = employeeData?.name || 'An employee';
    const department = employeeData?.department || 'Unknown department';
    
    for (const managerId of managerIds) {
      await sendNotification({
        user_id: managerId,
        title: "New leave request",
        message: `${employeeName} (${department}) has submitted a new leave request that requires your review.`,
        type: "info",
        related_entity: "leave_calendar",
        related_id: payload.new.id
      });
    }
  } catch (error) {
    console.error("Error sending additional notifications to managers:", error);
  }
};
