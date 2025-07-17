
import { toast as toastFunction } from "@/hooks/use-toast";
import { sendNotification } from '@/services/notifications/notification-sender';
import { getManagerUserIds } from '@/services/notifications/role-utils';

// Define ToastAPI type based on the actual structure of the toast function
type ToastAPI = typeof toastFunction;

export const useManagerNotifier = () => {
  const notifyManager = async (managerInfo: { user_id: string, name: string } | null, toast: ToastAPI) => {
    if (!managerInfo || !managerInfo.user_id) return;
    
    try {
      // Get all manager user IDs
      const managerIds = await getManagerUserIds();
      
      // Send notifications to all managers
      for (const managerId of managerIds) {
        await sendNotification({
          user_id: managerId,
          title: "🔔 Employee Clocked In",
          message: `${managerInfo.name} has clocked in and started their shift.`,
          type: "info",
          related_entity: "attendance",
          related_id: managerInfo.user_id
        });
      }
      
      console.log(`Notified ${managerIds.length} managers about ${managerInfo.name} clocking in`);
      
      toast({
        title: "Connected to manager",
        description: `You've been connected to manager: ${managerInfo.name}`,
      });
    } catch (error) {
      console.error("Failed to notify manager:", error);
    }
  };

  return { notifyManager };
};
