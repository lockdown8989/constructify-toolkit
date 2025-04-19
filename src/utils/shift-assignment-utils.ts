
import { supabase } from '@/integrations/supabase/client';
import { sendNotification } from '@/services/notifications/notification-sender';
import { generateShiftNotificationMessage } from './shift-notification-utils';

export const createShiftScheduleEntry = async (
  employeeId: string, 
  openShift: any, 
  userId: string
) => {
  // Create open shift assignment
  const { data: assignmentData, error: assignmentError } = await supabase
    .from('open_shift_assignments')
    .insert({
      open_shift_id: openShift.id,
      employee_id: employeeId,
      assigned_by: userId,
      status: 'confirmed'
    })
    .select()
    .single();

  if (assignmentError) {
    throw new Error(`Failed to create shift assignment: ${assignmentError.message}`);
  }

  // Create schedule entry
  const { data: scheduleData, error: scheduleError } = await supabase
    .from('schedules')
    .insert({
      employee_id: employeeId,
      title: openShift.title,
      start_time: openShift.start_time,
      end_time: openShift.end_time,
      status: 'confirmed'
    })
    .select()
    .single();

  if (scheduleError) {
    throw new Error(`Failed to create schedule entry: ${scheduleError.message}`);
  }

  return { assignmentData, scheduleData };
};

export const sendShiftAssignmentNotification = async (
  employeeId: string, 
  openShift: any, 
  scheduleDataId: string
) => {
  // Fetch employee details for notification
  const { data: employee, error: employeeError } = await supabase
    .from('employees')
    .select('user_id, name')
    .eq('id', employeeId)
    .single();

  if (employeeError) {
    throw new Error(`Failed to fetch employee details: ${employeeError.message}`);
  }

  if (employee.user_id) {
    const notificationMessage = generateShiftNotificationMessage(
      openShift.title, 
      new Date(openShift.start_time), 
      new Date(openShift.end_time)
    );

    await sendNotification({
      user_id: employee.user_id,
      title: 'New Shift Assignment 📅',
      message: notificationMessage,
      type: 'info',
      related_entity: 'schedules',
      related_id: scheduleDataId
    });
  }
};
