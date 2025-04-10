
import { supabase } from "@/integrations/supabase/client";
import type { NotificationData } from "@/models/notification";
import { getManagerUserIds } from "./role-utils";
import { sendNotificationToMany } from "./notification-sender";
import type { LeaveEvent } from "@/hooks/leave/leave-types";

/**
 * Notifies managers when a new leave request is submitted
 */
export const notifyManagersOfNewLeaveRequest = async (leaveRequest: LeaveEvent): Promise<boolean> => {
  try {
    console.log('NotificationService: Notifying managers of new leave request', leaveRequest);
    
    // Get all manager user IDs
    const managerIds = await getManagerUserIds();
    
    if (managerIds.length === 0) {
      console.log('NotificationService: No manager IDs found to notify');
      return false;
    }
    
    console.log('NotificationService: Found manager IDs:', managerIds);
    
    // Get employee name for the notification
    const { data: employeeData, error: employeeError } = await supabase
      .from('employees')
      .select('name')
      .eq('id', leaveRequest.employee_id)
      .single();
      
    if (employeeError) {
      console.error('Error getting employee name:', employeeError);
      throw employeeError;
    }
    
    const employeeName = employeeData?.name || 'An employee';
    console.log('NotificationService: Employee name:', employeeName);
    
    // Build notification data
    const notificationData: Omit<NotificationData, 'user_id'> = {
      title: 'New Leave Request',
      message: `${employeeName} has submitted a new leave request from ${leaveRequest.start_date} to ${leaveRequest.end_date}`,
      type: 'info',
      related_entity: 'leave_calendar',
      related_id: leaveRequest.id
    };
    
    console.log('NotificationService: Preparing to send notifications with data:', notificationData);
    
    // Send notifications to all managers
    const result = await sendNotificationToMany(managerIds, notificationData);
    console.log('NotificationService: Managers notification result:', result);
    
    return true;
  } catch (error) {
    console.error('Exception notifying managers of new leave request:', error);
    return false;
  }
};

/**
 * Notifies an employee when their leave request status changes
 */
export const notifyEmployeeOfLeaveStatusChange = async (
  leaveRequest: LeaveEvent, 
  status: 'Approved' | 'Rejected'
): Promise<boolean> => {
  try {
    console.log(`NotificationService: Notifying employee of leave request ${status.toLowerCase()}`);
    
    // Get the employee's user ID
    const { data: employeeData, error: employeeError } = await supabase
      .from('employees')
      .select('user_id')
      .eq('id', leaveRequest.employee_id)
      .single();
      
    if (employeeError) {
      console.error('Error getting employee user ID:', employeeError);
      throw employeeError;
    }
    
    if (!employeeData?.user_id) {
      console.log('No user ID associated with employee record');
      return false;
    }
    
    // Build notification data
    const notificationData: Omit<NotificationData, 'user_id'> = {
      title: `Leave Request ${status}`,
      message: `Your leave request from ${leaveRequest.start_date} to ${leaveRequest.end_date} has been ${status.toLowerCase()}.`,
      type: status === 'Approved' ? 'success' : 'warning',
      related_entity: 'leave_calendar',
      related_id: leaveRequest.id
    };
    
    // Send notification to the employee
    await sendNotificationToMany([employeeData.user_id], notificationData);
    console.log('NotificationService: Employee notified successfully');
    
    return true;
  } catch (error) {
    console.error(`Exception notifying employee of leave request ${status.toLowerCase()}:`, error);
    return false;
  }
};
