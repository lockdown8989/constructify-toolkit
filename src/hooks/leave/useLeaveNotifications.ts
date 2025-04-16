
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { sendNotification } from "@/services/notifications";
import { useWebhookNotification } from "@/hooks/leave/useWebhookNotification";

export const useLeaveNotifications = () => {
  const { toast } = useToast();
  const { sendWebhookNotification } = useWebhookNotification();
  
  const showStatusChangeToast = (
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
  
  const notifyEmployee = async (
    leaveData: any, 
    status: 'Approved' | 'Rejected'
  ) => {
    if (!leaveData.employee_id) return;
    
    try {
      // Get employee data
      const { data: employeeData } = await supabase
        .from('employees')
        .select('name, department, user_id')
        .eq('id', leaveData.employee_id)
        .single();
      
      if (employeeData?.user_id) {
        // Send in-app notification
        await sendNotification({
          user_id: employeeData.user_id,
          title: `Leave Request ${status}`,
          message: `Your leave request from ${leaveData.start_date} to ${leaveData.end_date} has been ${status.toLowerCase()}.`,
          type: status === 'Approved' ? 'success' : 'warning',
          related_entity: 'leave_calendar',
          related_id: leaveData.id
        });
        
        // Send webhook notification
        await sendWebhookNotification(
          employeeData.user_id,
          `Leave Request ${status}`,
          `A leave request for ${leaveData.type} from ${leaveData.start_date} to ${leaveData.end_date} has been ${status.toLowerCase()}.`,
          'leave'
        );
      }
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };
  
  return {
    showStatusChangeToast,
    notifyEmployee
  };
};
