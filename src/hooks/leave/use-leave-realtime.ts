
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useLeaveNotifications } from "@/hooks/leave/useLeaveNotifications";
import { getManagerUserIds } from "@/services/notifications/role-utils";
import { sendNotification } from "@/services/notifications";

export const useLeaveRealtime = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isManager, isAdmin, isHR } = useAuth();
  const { showStatusChangeToast, notifyEmployee } = useLeaveNotifications();
  
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
            await handleLeaveUpdate(payload, user.id, hasManagerAccess);
          } else if (payload.eventType === 'INSERT') {
            await handleLeaveInsert(payload, user.id, hasManagerAccess);
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
  }, [queryClient, toast, user, hasManagerAccess, notifyEmployee]);
  
  // Helper functions
  const handleLeaveUpdate = async (
    payload: any,
    userId: string,
    hasManagerAccess: boolean
  ) => {
    const newStatus = payload.new.status;
    const oldStatus = payload.old.status;
    
    if (oldStatus === 'Pending') {
      await handleStatusChange(payload, userId, hasManagerAccess, newStatus);
    }
  };
  
  const handleLeaveInsert = async (
    payload: any,
    userId: string,
    hasManagerAccess: boolean
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
    newStatus: string
  ) => {
    const isYourRequest = userId === payload.new.employee_id;
    
    if ((isYourRequest || hasManagerAccess)) {
      if (newStatus === 'Approved') {
        showStatusChangeToast(isYourRequest, payload.new, 'approved');
        await notifyEmployee(payload.new, 'Approved');
      } else if (newStatus === 'Rejected') {
        showStatusChangeToast(isYourRequest, payload.new, 'rejected');
        await notifyEmployee(payload.new, 'Rejected');
      }
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
};
