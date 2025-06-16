
import { supabase } from '@/integrations/supabase/client';
import { sendNotification } from '@/services/notifications/notification-sender';

export interface ShiftNotification {
  id: string;
  employee_id: string;
  shift_date: string;
  shift_start_time: string;
  shift_end_time: string;
  notification_type: 'shift_start_reminder' | 'shift_end_reminder';
  notification_time: string;
  sent: boolean;
}

/**
 * Creates shift notifications for all active employees based on their weekly availability
 */
export const createShiftNotifications = async () => {
  try {
    console.log('Creating shift notifications for all employees...');
    
    const { error } = await supabase.rpc('create_shift_notifications');
    
    if (error) {
      console.error('Error creating shift notifications:', error);
      throw error;
    }
    
    console.log('Shift notifications created successfully');
    return true;
  } catch (error) {
    console.error('Failed to create shift notifications:', error);
    throw error;
  }
};

/**
 * Sends due shift notifications to employees
 */
export const sendDueShiftNotifications = async () => {
  try {
    console.log('Sending due shift notifications...');
    
    const { error } = await supabase.rpc('send_due_shift_notifications');
    
    if (error) {
      console.error('Error sending due shift notifications:', error);
      throw error;
    }
    
    console.log('Due shift notifications sent successfully');
    return true;
  } catch (error) {
    console.error('Failed to send due shift notifications:', error);
    throw error;
  }
};

/**
 * Gets pending shift notifications for a specific employee
 */
export const getEmployeeShiftNotifications = async (employeeId: string) => {
  try {
    const { data, error } = await supabase
      .from('shift_notifications')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('sent', false)
      .gte('notification_time', new Date().toISOString())
      .order('notification_time', { ascending: true });
    
    if (error) {
      console.error('Error fetching shift notifications:', error);
      throw error;
    }
    
    return data as ShiftNotification[];
  } catch (error) {
    console.error('Failed to fetch shift notifications:', error);
    throw error;
  }
};

/**
 * Calculates overtime for an employee if they haven't clocked out by their scheduled end time
 */
export const calculateRealTimeOvertime = async (employeeId: string, attendanceId: string) => {
  try {
    console.log('Calculating real-time overtime for employee:', employeeId);
    
    // Get today's date and day of week
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sunday, 1=Monday, etc.
    
    // Get employee's scheduled end time for today
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select(`
        sunday_end_time,
        monday_end_time,
        tuesday_end_time,
        wednesday_end_time,
        thursday_end_time,
        friday_end_time,
        saturday_end_time
      `)
      .eq('id', employeeId)
      .single();
    
    if (employeeError) {
      console.error('Error fetching employee schedule:', employeeError);
      return false;
    }
    
    // Get scheduled end time based on day of week
    const dayColumns = [
      'sunday_end_time', 'monday_end_time', 'tuesday_end_time',
      'wednesday_end_time', 'thursday_end_time', 'friday_end_time', 'saturday_end_time'
    ];
    
    const scheduledEndTime = employee[dayColumns[dayOfWeek] as keyof typeof employee] as string;
    
    if (!scheduledEndTime) {
      console.log('No scheduled end time found for today');
      return false;
    }
    
    // Check if current time is past scheduled end time
    const now = new Date();
    const scheduledEnd = new Date();
    const [hours, minutes] = scheduledEndTime.split(':');
    scheduledEnd.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    if (now > scheduledEnd) {
      // Calculate overtime minutes
      const overtimeMinutes = Math.floor((now.getTime() - scheduledEnd.getTime()) / (1000 * 60));
      
      // Update attendance record with overtime
      const { error: updateError } = await supabase
        .from('attendance')
        .update({ 
          overtime_minutes: overtimeMinutes,
          overtime_status: 'pending'
        })
        .eq('id', attendanceId)
        .eq('active_session', true);
      
      if (updateError) {
        console.error('Error updating overtime:', updateError);
        return false;
      }
      
      console.log(`Updated overtime: ${overtimeMinutes} minutes`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error calculating real-time overtime:', error);
    return false;
  }
};

/**
 * Monitors employee attendance for overtime and sends notifications
 */
export const monitorAttendanceForOvertime = async () => {
  try {
    // Get all active attendance sessions
    const { data: activeSessions, error } = await supabase
      .from('attendance')
      .select('id, employee_id, check_in, scheduled_end_time')
      .eq('active_session', true)
      .is('check_out', null);
    
    if (error) {
      console.error('Error fetching active sessions:', error);
      return;
    }
    
    if (!activeSessions || activeSessions.length === 0) {
      return;
    }
    
    // Check each active session for overtime
    for (const session of activeSessions) {
      await calculateRealTimeOvertime(session.employee_id, session.id);
    }
  } catch (error) {
    console.error('Error monitoring attendance for overtime:', error);
  }
};
