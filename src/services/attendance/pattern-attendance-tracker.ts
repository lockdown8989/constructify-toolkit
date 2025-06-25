
import { supabase } from '@/integrations/supabase/client';
import { sendNotification } from '@/services/notifications/notification-sender';

export interface AttendanceMetrics {
  isLate: boolean;
  lateMinutes: number;
  isOvertime: boolean;
  overtimeMinutes: number;
  scheduledStart: string;
  scheduledEnd: string;
  shiftPatternId?: string;
}

/**
 * Enhanced attendance tracking that follows shift pattern rules
 */
export const trackPatternBasedAttendance = async (
  employeeId: string,
  checkInTime: Date,
  checkOutTime?: Date
): Promise<AttendanceMetrics> => {
  console.log('Tracking pattern-based attendance for employee:', employeeId);
  
  const dayOfWeek = checkInTime.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Get employee's assigned shift pattern for today
  const { data: assignments, error: assignmentError } = await supabase
    .from('shift_pattern_assignments')
    .select(`
      shift_pattern_id,
      shift_patterns!inner(
        id,
        name,
        start_time,
        end_time,
        grace_period_minutes,
        overtime_threshold_minutes
      )
    `)
    .eq('employee_id', employeeId)
    .eq('is_active', true);

  if (assignmentError) {
    console.error('Error fetching shift pattern assignments:', assignmentError);
    throw assignmentError;
  }

  // Default metrics
  let metrics: AttendanceMetrics = {
    isLate: false,
    lateMinutes: 0,
    isOvertime: false,
    overtimeMinutes: 0,
    scheduledStart: '09:00:00',
    scheduledEnd: '17:00:00'
  };

  if (assignments && assignments.length > 0) {
    const assignment = assignments[0];
    const pattern = assignment.shift_patterns;
    
    if (pattern && typeof pattern === 'object' && !Array.isArray(pattern)) {
      metrics.shiftPatternId = pattern.id;
      metrics.scheduledStart = pattern.start_time;
      metrics.scheduledEnd = pattern.end_time;

      // Calculate scheduled times for today
      const today = checkInTime.toDateString();
      const scheduledStartTime = new Date(`${today} ${pattern.start_time}`);
      const scheduledEndTime = new Date(`${today} ${pattern.end_time}`);
      
      // Add grace period to start time
      const graceStartTime = new Date(scheduledStartTime.getTime() + (pattern.grace_period_minutes * 60000));
      
      // Check if late
      if (checkInTime > graceStartTime) {
        metrics.isLate = true;
        metrics.lateMinutes = Math.floor((checkInTime.getTime() - scheduledStartTime.getTime()) / 60000);
      }

      // Check overtime if checked out
      if (checkOutTime) {
        const overtimeThresholdTime = new Date(scheduledEndTime.getTime() + (pattern.overtime_threshold_minutes * 60000));
        
        if (checkOutTime > overtimeThresholdTime) {
          metrics.isOvertime = true;
          metrics.overtimeMinutes = Math.floor((checkOutTime.getTime() - scheduledEndTime.getTime()) / 60000);
        }
      }

      console.log('Pattern-based attendance metrics:', metrics);
    }
  }

  return metrics;
};

/**
 * Automatically track overtime for employees who haven't clocked out
 */
export const trackMissedClockOut = async () => {
  console.log('Checking for missed clock-outs and automatic overtime tracking...');
  
  try {
    // Get all active attendance sessions
    const { data: activeSessions, error } = await supabase
      .from('attendance')
      .select(`
        id,
        employee_id,
        check_in,
        shift_pattern_id,
        employees!inner(user_id, name)
      `)
      .eq('active_session', true)
      .is('check_out', null);

    if (error) {
      console.error('Error fetching active sessions:', error);
      return;
    }

    if (!activeSessions || activeSessions.length === 0) {
      console.log('No active sessions found');
      return;
    }

    const now = new Date();
    
    for (const session of activeSessions) {
      if (!session.shift_pattern_id) continue;

      // Get shift pattern details
      const { data: pattern, error: patternError } = await supabase
        .from('shift_patterns')
        .select('*')
        .eq('id', session.shift_pattern_id)
        .single();

      if (patternError || !pattern) continue;

      // Calculate expected end time
      const checkInDate = new Date(session.check_in);
      const today = checkInDate.toDateString();
      const expectedEndTime = new Date(`${today} ${pattern.end_time}`);
      const overtimeThreshold = new Date(expectedEndTime.getTime() + (pattern.overtime_threshold_minutes * 60000));

      // If current time is past overtime threshold, start recording overtime
      if (now > overtimeThreshold) {
        const overtimeMinutes = Math.floor((now.getTime() - expectedEndTime.getTime()) / 60000);
        
        // Update attendance record
        const { error: updateError } = await supabase
          .from('attendance')
          .update({
            overtime_minutes: overtimeMinutes,
            overtime_status: 'pending'
          })
          .eq('id', session.id);

        if (updateError) {
          console.error('Error updating overtime:', updateError);
          continue;
        }

        // Notify employee and managers about overtime
        const employee = session.employees;
        if (employee && typeof employee === 'object' && !Array.isArray(employee) && employee.user_id) {
          await sendNotification({
            user_id: employee.user_id,
            title: '⏰ Overtime Alert',
            message: `You have been working for ${overtimeMinutes} minutes of overtime. Please remember to clock out.`,
            type: 'warning',
            related_entity: 'attendance',
            related_id: session.id
          });
        }

        console.log(`Updated overtime for employee ${employee && typeof employee === 'object' && !Array.isArray(employee) ? employee.name : 'Unknown'}: ${overtimeMinutes} minutes`);
      }
    }
  } catch (error) {
    console.error('Error in trackMissedClockOut:', error);
  }
};

/**
 * Check for late arrivals and notify managers
 */
export const checkLateArrivals = async () => {
  console.log('Checking for late arrivals...');
  
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Get today's attendance records with late arrivals
    const { data: lateArrivals, error } = await supabase
      .from('attendance')
      .select(`
        id,
        employee_id,
        check_in,
        late_minutes,
        is_late,
        employees!inner(user_id, name)
      `)
      .eq('date', today)
      .eq('is_late', true)
      .gt('late_minutes', 0);

    if (error) {
      console.error('Error fetching late arrivals:', error);
      return;
    }

    if (!lateArrivals || lateArrivals.length === 0) {
      return;
    }

    // Notify managers about late arrivals
    const { data: managers, error: managersError } = await supabase
      .from('user_roles')
      .select('user_id')
      .in('role', ['admin', 'employer', 'hr', 'manager']);

    if (managersError || !managers) {
      console.error('Error fetching managers:', managersError);
      return;
    }

    for (const arrival of lateArrivals) {
      const employee = arrival.employees;
      
      if (employee && typeof employee === 'object' && !Array.isArray(employee) && employee.name) {
        // Notify all managers
        for (const manager of managers) {
          await sendNotification({
            user_id: manager.user_id,
            title: '⏰ Late Arrival Alert',
            message: `${employee.name} arrived ${arrival.late_minutes} minutes late today.`,
            type: 'warning',
            related_entity: 'attendance',
            related_id: arrival.id
          });
        }
      }
    }

    console.log(`Notified managers about ${lateArrivals.length} late arrivals`);
  } catch (error) {
    console.error('Error in checkLateArrivals:', error);
  }
};
