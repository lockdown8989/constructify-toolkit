
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
      .eq('role', mapUIRoleToDBRole('manager')); // Now uses the mapping function
      
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

/**
 * Notifies an employee about the status change of their leave request
 * @param leaveRequestId The ID of the leave request
 * @param employeeId The ID of the employee who submitted the request
 * @param status The new status of the leave request (Approved or Rejected)
 * @param startDate The start date of the leave request
 * @param endDate The end date of the leave request
 * @returns true if notifications were sent successfully, false otherwise
 */
export const notifyEmployeeAboutLeaveStatus = async (
  leaveRequestId: string,
  employeeId: string,
  status: 'Approved' | 'Rejected',
  startDate: string,
  endDate: string
): Promise<boolean> => {
  try {
    // Get employee's user ID from employees table
    const { data: employeeData, error: employeeError } = await supabase
      .from('employees')
      .select('user_id, name')
      .eq('id', employeeId)
      .single();
      
    if (employeeError || !employeeData) {
      console.error("Error fetching employee data:", employeeError);
      return false;
    }
    
    // Get leave request details for better notification content
    const { data: leaveData, error: leaveError } = await supabase
      .from('leave_calendar')
      .select('type')
      .eq('id', leaveRequestId)
      .single();
      
    if (leaveError) {
      console.error("Error fetching leave data:", leaveError);
      // Continue even if we can't get the leave type
    }
    
    const leaveType = leaveData?.type || "Leave";
    
    // Create notification for the employee
    const notification = {
      user_id: employeeData.user_id,
      title: `Leave Request ${status}`,
      message: `Your ${leaveType} request from ${startDate} to ${endDate} has been ${status.toLowerCase()}.`,
      type: status === 'Approved' ? 'success' : 'warning',
      related_entity: 'leave_calendar',
      related_id: leaveRequestId
    };
    
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert(notification);
      
    if (notificationError) {
      console.error("Error creating employee notification:", notificationError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Exception in notifyEmployeeAboutLeaveStatus:", error);
    return false;
  }
};
