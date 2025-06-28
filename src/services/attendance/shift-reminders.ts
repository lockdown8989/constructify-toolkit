
import { supabase } from '@/integrations/supabase/client';
import { sendNotification } from '@/services/notifications/notification-sender';

/**
 * Check for employees who should have clocked out and send reminders
 */
export const checkAndSendClockOutReminders = async () => {
  try {
    const now = new Date();
    const currentTime = now.toISOString();
    
    // Find schedules that should have ended but employee is still clocked in
    const { data: overdueShifts, error } = await supabase
      .from('schedules')
      .select(`
        id,
        employee_id,
        title,
        start_time,
        end_time,
        employees!inner(user_id, name)
      `)
      .eq('status', 'confirmed')
      .lt('end_time', currentTime)
      .gte('start_time', new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()); // Within last 24 hours
    
    if (error) throw error;
    
    if (!overdueShifts || overdueShifts.length === 0) {
      return { success: true, message: 'No overdue shifts found' };
    }
    
    // Check which employees are still clocked in
    for (const shift of overdueShifts) {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: attendance, error: attendanceError } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', shift.employee_id)
        .eq('date', today)
        .eq('active_session', true)
        .single();
        
      if (attendanceError && attendanceError.code !== 'PGRST116') {
        console.error('Error checking attendance:', attendanceError);
        continue;
      }
      
      // If employee is still clocked in past shift end time
      if (attendance && attendance.active_session) {
        const shiftEndTime = new Date(shift.end_time);
        const timePastEnd = Math.floor((now.getTime() - shiftEndTime.getTime()) / (1000 * 60)); // minutes
        
        if (timePastEnd > 15) { // 15 minutes grace period
          // Calculate overtime
          const overtimeMinutes = timePastEnd;
          
          // Update attendance with overtime
          await supabase
            .from('attendance')
            .update({
              overtime_minutes: (attendance.overtime_minutes || 0) + overtimeMinutes,
              notes: `Overtime: ${overtimeMinutes} minutes past scheduled end time`
            })
            .eq('id', attendance.id);
          
          // Send reminder notification
          const employee = shift.employees as any;
          if (employee && employee.user_id) {
            await sendNotification({
              user_id: employee.user_id,
              title: '⏰ Clock Out Reminder',
              message: `Your shift "${shift.title}" ended ${timePastEnd} minutes ago. Please clock out now to avoid additional overtime charges.`,
              type: 'warning',
              related_entity: 'attendance',
              related_id: attendance.id
            });
          }
        }
      }
    }
    
    return { success: true, message: `Processed ${overdueShifts.length} shifts` };
  } catch (error) {
    console.error('Error checking clock out reminders:', error);
    return { success: false, error };
  }
};

/**
 * Record late clock-in for employees
 */
export const recordLateClockIn = async (employeeId: string, attendanceId: string) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Find today's scheduled shift for this employee
    const { data: todayShift, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('employee_id', employeeId)
      .gte('start_time', `${today}T00:00:00`)
      .lt('start_time', `${today}T23:59:59`)
      .eq('status', 'confirmed')
      .single();
      
    if (error || !todayShift) {
      console.log('No scheduled shift found for today');
      return { success: true, message: 'No scheduled shift' };
    }
    
    const { data: attendance, error: attendanceError } = await supabase
      .from('attendance')
      .select('*')
      .eq('id', attendanceId)
      .single();
      
    if (attendanceError || !attendance) {
      throw new Error('Attendance record not found');
    }
    
    const scheduledStart = new Date(todayShift.start_time);
    const actualClockIn = new Date(attendance.check_in);
    const lateMinutes = Math.floor((actualClockIn.getTime() - scheduledStart.getTime()) / (1000 * 60));
    
    if (lateMinutes > 5) { // 5 minute grace period
      // Update attendance record
      await supabase
        .from('attendance')
        .update({
          is_late: true,
          late_minutes: lateMinutes,
          scheduled_start_time: scheduledStart.toTimeString().slice(0, 8),
          notes: `Late by ${lateMinutes} minutes`
        })
        .eq('id', attendanceId);
        
      // Get employee details for notification
      const { data: employee } = await supabase
        .from('employees')
        .select('user_id, name')
        .eq('id', employeeId)
        .single();
        
      // Notify managers about late clock-in
      const { data: managers } = await supabase
        .from('user_roles')
        .select('user_id')
        .in('role', ['admin', 'employer', 'hr']);
        
      if (managers && managers.length > 0) {
        for (const manager of managers) {
          await sendNotification({
            user_id: manager.user_id,
            title: '⏰ Late Clock-In Alert',
            message: `${employee?.name || 'Employee'} clocked in ${lateMinutes} minutes late for their shift on ${today}.`,
            type: 'warning',
            related_entity: 'attendance',
            related_id: attendanceId
          });
        }
      }
      
      console.log(`Recorded late clock-in: ${lateMinutes} minutes for employee ${employeeId}`);
    }
    
    return { success: true, lateMinutes };
  } catch (error) {
    console.error('Error recording late clock-in:', error);
    return { success: false, error };
  }
};
