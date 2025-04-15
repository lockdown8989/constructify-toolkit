
import { supabase } from '@/integrations/supabase/client';
import { sendNotification, sendNotificationToMany } from './notification-sender';
import { getManagerUserIds } from './role-utils';

/**
 * Sends a notification to managers about a new leave request
 */
export const notifyManagersAboutLeaveRequest = async (
  leaveId: string, 
  employeeId: string,
  startDate: string, 
  endDate: string
) => {
  try {
    // Get employee name
    const { data: employeeData } = await supabase
      .from('employees')
      .select('name')
      .eq('id', employeeId)
      .single();
    
    const employeeName = employeeData?.name || 'An employee';
    
    // Get all manager user IDs - this function should map 'manager' to 'employer' internally
    const managerIds = await getManagerUserIds();
    
    // Format dates for the message
    const formattedDates = startDate === endDate
      ? `on ${new Date(startDate).toLocaleDateString()}`
      : `from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`;
    
    // Send notifications to all managers
    await sendNotificationToMany(managerIds, {
      title: 'New Leave Request',
      message: `${employeeName} has requested leave ${formattedDates}`,
      type: 'info',
      related_entity: 'leave_calendar',
      related_id: leaveId
    });
    
    console.log(`Notified ${managerIds.length} managers about leave request ${leaveId}`);
    return true;
  } catch (error) {
    console.error('Error sending leave request notifications:', error);
    return false;
  }
};

/**
 * Notifies an employee about their leave request status change
 */
export const notifyEmployeeAboutLeaveStatus = async (
  leaveId: string,
  employeeId: string,
  status: 'Approved' | 'Rejected',
  startDate: string,
  endDate: string
) => {
  try {
    // Get employee user ID from employee table
    const { data: employeeData, error: employeeError } = await supabase
      .from('employees')
      .select('user_id')
      .eq('id', employeeId)
      .single();
    
    if (employeeError || !employeeData?.user_id) {
      console.error('Error finding user ID for employee:', employeeError);
      return false;
    }
    
    // Format dates for the message
    const formattedDates = startDate === endDate
      ? `on ${new Date(startDate).toLocaleDateString()}`
      : `from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`;
    
    const title = status === 'Approved' 
      ? 'Leave Request Approved'
      : 'Leave Request Rejected';
    
    const message = status === 'Approved'
      ? `Your leave request ${formattedDates} has been approved`
      : `Your leave request ${formattedDates} has been rejected`;
    
    const type = status === 'Approved' ? 'success' : 'warning';
    
    // Send notification to the employee
    await sendNotification({
      user_id: employeeData.user_id,
      title,
      message,
      type,
      related_entity: 'leave_calendar',
      related_id: leaveId
    });
    
    console.log(`Notified employee ${employeeId} about leave status change to ${status}`);
    return true;
  } catch (error) {
    console.error('Error sending leave status notification:', error);
    return false;
  }
};
