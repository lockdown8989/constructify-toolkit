
import { supabase } from '@/integrations/supabase/client';
import { mapUIRoleToDBRole } from '@/hooks/auth/types';

/**
 * Notifies managers about a new leave request
 * @param leaveRequestId The ID of the leave request
 * @param employeeId The ID of the employee who submitted the request
 * @param startDate The start date of the leave request
 * @param endDate The end date of the leave request
 * @returns true if notifications were sent successfully, false otherwise
 */
export const notifyManagersAboutLeaveRequest = async (
  leaveRequestId: string,
  employeeId: string,
  startDate: string,
  endDate: string
): Promise<boolean> => {
  try {
    // Get all users with manager/employer role
    const { data: managerRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'employer'); // Use the database role value 'employer' not 'manager'
      
    if (roleError) {
      console.error("Error fetching managers:", roleError);
      return false;
    }
    
    if (!managerRoles || managerRoles.length === 0) {
      console.warn("No managers found in the system");
      return false;
    }
    
    // Get the employee name for better notification content
    const { data: employeeData, error: employeeError } = await supabase
      .from('employees')
      .select('name')
      .eq('id', employeeId)
      .single();
      
    if (employeeError) {
      console.error("Error fetching employee data:", employeeError);
      // Continue even if we can't get the employee name
    }
    
    const employeeName = employeeData?.name || "An employee";
    
    // Create notifications for all managers
    const notifications = managerRoles.map(manager => ({
      user_id: manager.user_id,
      title: 'New Leave Request',
      message: `${employeeName} has requested leave from ${startDate} to ${endDate}. Please review.`,
      type: 'info',
      related_entity: 'leave_calendar',
      related_id: leaveRequestId
    }));
    
    if (notifications.length > 0) {
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert(notifications);
        
      if (notificationError) {
        console.error("Error creating manager notifications:", notificationError);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error("Exception in notifyManagersAboutLeaveRequest:", error);
    return false;
  }
};
