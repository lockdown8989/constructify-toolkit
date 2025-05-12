
import { supabase } from '@/integrations/supabase/client';
import { getUsersWithRole } from './role-utils';

/**
 * Sends leave request notifications to managers
 */
export const notifyManagersAboutLeaveRequest = async (
  requestId: string,
  employeeId: string,
  startDate: string,
  endDate: string
): Promise<boolean> => {
  try {
    // Get the employee details
    const { data: employee } = await supabase
      .from('employees')
      .select('name, department')
      .eq('id', employeeId)
      .single();

    if (!employee) {
      console.error('Employee not found');
      return false;
    }

    // Get all users with manager role
    const managers = await getUsersWithRole('manager');
    
    if (!managers || managers.length === 0) {
      console.warn('No managers found to notify');
      return false;
    }

    // Create notifications for all managers
    const notifications = managers.map(manager => ({
      user_id: manager.id,
      title: 'New Leave Request',
      content: `${employee.name} has requested leave from ${startDate} to ${endDate}`,
      type: 'leave_request',
      metadata: {
        request_id: requestId,
        employee_id: employeeId,
        employee_name: employee.name,
        department: employee.department,
        start_date: startDate,
        end_date: endDate,
        status: 'pending'
      },
      is_read: false
    }));

    // Insert notifications
    const { error } = await supabase
      .from('notifications')
      .insert(notifications);

    if (error) {
      console.error('Error sending manager notifications:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in notifyManagersAboutLeaveRequest:', error);
    return false;
  }
};

/**
 * Notify employee about leave request status update
 */
export const notifyEmployeeAboutLeaveStatus = async (
  employeeId: string,
  requestId: string,
  status: 'approved' | 'rejected',
  startDate: string,
  endDate: string,
  managerNotes?: string
): Promise<boolean> => {
  try {
    // Get employee user ID
    const { data: employee } = await supabase
      .from('employees')
      .select('user_id, name')
      .eq('id', employeeId)
      .single();

    if (!employee || !employee.user_id) {
      console.error('Employee user account not found');
      return false;
    }

    const title = status === 'approved' 
      ? 'Leave Request Approved' 
      : 'Leave Request Rejected';
    
    const content = status === 'approved'
      ? `Your leave request from ${startDate} to ${endDate} has been approved.`
      : `Your leave request from ${startDate} to ${endDate} has been rejected.${managerNotes ? ' See notes for details.' : ''}`;

    // Create notification
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: employee.user_id,
        title,
        content,
        type: 'leave_status',
        metadata: {
          request_id: requestId,
          status,
          start_date: startDate,
          end_date: endDate,
          manager_notes: managerNotes || null
        },
        is_read: false
      });

    if (error) {
      console.error('Error sending employee notification:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in notifyEmployeeAboutLeaveStatus:', error);
    return false;
  }
};
