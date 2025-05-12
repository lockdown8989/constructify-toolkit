
import { sendNotification } from './notification-sender';
import { supabase } from '@/integrations/supabase/client';
import { Schedule } from '@/types/supabase/schedules';

/**
 * Send notification when a schedule is assigned to an employee
 */
export const sendShiftAssignmentNotification = async (
  employeeId: string,
  schedule: Schedule,
  assignedById: string
) => {
  try {
    // Get employee user_id from employees table
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('user_id, name')
      .eq('id', employeeId)
      .single();
    
    if (employeeError || !employee?.user_id) {
      console.error('Error fetching employee details:', employeeError);
      return { success: false, message: 'Unable to find employee' };
    }
    
    // Get assigner name (manager who assigned the shift)
    const { data: assigner } = await supabase
      .from('employees')
      .select('name')
      .eq('user_id', assignedById)
      .single();
      
    const assignerName = assigner?.name || 'Manager';
    
    // Format dates for display
    const startDate = new Date(schedule.start_time);
    const endDate = new Date(schedule.end_time);
    
    const formattedStart = startDate.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
    
    const formattedEnd = endDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
    
    // Send notification to employee
    await sendNotification({
      user_id: employee.user_id,
      title: 'New Shift Assignment',
      message: `${assignerName} has assigned you a new shift: ${schedule.title || 'Work Shift'}\n${formattedStart} - ${formattedEnd}${schedule.location ? '\nLocation: ' + schedule.location : ''}`,
      type: 'info',
      related_entity: 'schedules',
      related_id: schedule.id
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error sending shift assignment notification:', error);
    return { success: false, message: 'Failed to send notification' };
  }
};

/**
 * Send notification when a schedule is updated
 */
export const sendShiftUpdateNotification = async (
  employeeId: string,
  schedule: Schedule,
  updatedById: string
) => {
  try {
    // Similar implementation to sendShiftAssignmentNotification
    const { data: employee } = await supabase
      .from('employees')
      .select('user_id')
      .eq('id', employeeId)
      .single();
      
    if (!employee?.user_id) return { success: false };
    
    await sendNotification({
      user_id: employee.user_id,
      title: 'Shift Updated',
      message: `Your shift (${schedule.title || 'Work Shift'}) has been updated. Please check your schedule for the latest details.`,
      type: 'info',
      related_entity: 'schedules',
      related_id: schedule.id
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error sending shift update notification:', error);
    return { success: false, message: 'Failed to send notification' };
  }
};

/**
 * Send notification when a schedule is cancelled
 */
export const sendShiftCancellationNotification = async (
  employeeId: string,
  scheduleTitle: string,
  scheduleId: string
) => {
  try {
    const { data: employee } = await supabase
      .from('employees')
      .select('user_id')
      .eq('id', employeeId)
      .single();
      
    if (!employee?.user_id) return { success: false };
    
    await sendNotification({
      user_id: employee.user_id,
      title: 'Shift Cancelled',
      message: `Your shift (${scheduleTitle || 'Work Shift'}) has been cancelled.`,
      type: 'info',
      related_entity: 'schedules',
      related_id: scheduleId
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error sending shift cancellation notification:', error);
    return { success: false, message: 'Failed to send notification' };
  }
};
