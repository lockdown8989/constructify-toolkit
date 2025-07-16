import { supabase } from '@/integrations/supabase/client';
import { sendNotification } from '@/services/notifications/notification-sender';

export interface RotaComplianceCheck {
  schedule_id: string;
  employee_id: string;
  rota_start_time: string;
  rota_end_time: string;
  actual_clock_in?: string;
  actual_clock_out?: string;
  is_late: boolean;
  is_early_departure: boolean;
  overtime_minutes: number;
  requires_approval: boolean;
}

/**
 * Checks attendance compliance against rota schedule
 */
export const checkRotaCompliance = async (attendanceId: string): Promise<RotaComplianceCheck | null> => {
  try {
    // Get attendance record with employee info
    const { data: attendance, error: attendanceError } = await supabase
      .from('attendance')
      .select(`
        *,
        employees!inner(id, user_id, name)
      `)
      .eq('id', attendanceId)
      .single();

    if (attendanceError || !attendance) {
      console.error('Error fetching attendance:', attendanceError);
      return null;
    }

    // Find the scheduled shift for this date and employee
    const attendanceDate = new Date(attendance.date).toISOString().split('T')[0];
    const { data: schedule, error: scheduleError } = await supabase
      .from('schedules')
      .select('*')
      .eq('employee_id', attendance.employee_id)
      .gte('start_time', `${attendanceDate}T00:00:00`)
      .lt('start_time', `${attendanceDate}T23:59:59`)
      .eq('status', 'confirmed')
      .single();

    if (scheduleError || !schedule) {
      console.log('No confirmed schedule found for attendance date');
      return null;
    }

    const rotaStart = new Date(schedule.start_time);
    const rotaEnd = new Date(schedule.end_time);
    const clockIn = attendance.check_in ? new Date(attendance.check_in) : null;
    const clockOut = attendance.check_out ? new Date(attendance.check_out) : null;

    // Check if late (more than 5 minutes after rota start)
    const isLate = clockIn ? clockIn.getTime() > rotaStart.getTime() + (5 * 60 * 1000) : false;
    
    // Check if early departure (more than 5 minutes before rota end)
    const isEarlyDeparture = clockOut ? clockOut.getTime() < rotaEnd.getTime() - (5 * 60 * 1000) : false;
    
    // Calculate overtime (work beyond rota end time)
    let overtimeMinutes = 0;
    if (clockOut && clockOut.getTime() > rotaEnd.getTime()) {
      overtimeMinutes = Math.floor((clockOut.getTime() - rotaEnd.getTime()) / (60 * 1000));
    }

    const complianceCheck: RotaComplianceCheck = {
      schedule_id: schedule.id,
      employee_id: attendance.employee_id,
      rota_start_time: schedule.start_time,
      rota_end_time: schedule.end_time,
      actual_clock_in: attendance.check_in,
      actual_clock_out: attendance.check_out,
      is_late: isLate,
      is_early_departure: isEarlyDeparture,
      overtime_minutes: overtimeMinutes,
      requires_approval: overtimeMinutes > 0
    };

    // Update attendance record with compliance data
    const { error: updateError } = await supabase
      .from('attendance')
      .update({
        is_late: isLate,
        late_minutes: isLate && clockIn ? Math.floor((clockIn.getTime() - rotaStart.getTime()) / (60 * 1000)) : 0,
        is_early_departure: isEarlyDeparture,
        early_departure_minutes: isEarlyDeparture && clockOut ? Math.floor((rotaEnd.getTime() - clockOut.getTime()) / (60 * 1000)) : 0,
        overtime_minutes: overtimeMinutes,
        overtime_status: overtimeMinutes > 0 ? 'pending' : null
      })
      .eq('id', attendanceId);

    if (updateError) {
      console.error('Error updating attendance compliance:', updateError);
    }

    // Send notifications for compliance issues or overtime
    if (attendance.employees?.user_id) {
      if (isLate) {
        await sendNotification({
          user_id: attendance.employees.user_id,
          title: '⏰ Late Clock-In Recorded',
          message: `You clocked in late for your shift. Please ensure you arrive on time for future shifts as per your rota schedule.`,
          type: 'warning',
          related_entity: 'attendance',
          related_id: attendanceId
        });
      }

      if (overtimeMinutes > 0) {
        await sendNotification({
          user_id: attendance.employees.user_id,
          title: '🕒 Overtime Recorded - Pending Approval',
          message: `You worked ${overtimeMinutes} minutes of overtime. This has been submitted for manager approval.`,
          type: 'info',
          related_entity: 'attendance',
          related_id: attendanceId
        });

        // Notify managers about overtime requiring approval
        const { data: managers } = await supabase
          .from('user_roles')
          .select('user_id')
          .in('role', ['admin', 'employer', 'hr', 'manager']);

        if (managers) {
          for (const manager of managers) {
            await sendNotification({
              user_id: manager.user_id,
              title: '⏰ Overtime Approval Required',
              message: `${attendance.employees.name} worked ${overtimeMinutes} minutes of overtime and requires approval.`,
              type: 'warning',
              related_entity: 'attendance',
              related_id: attendanceId
            });
          }
        }
      }
    }

    return complianceCheck;
  } catch (error) {
    console.error('Error checking rota compliance:', error);
    return null;
  }
};

/**
 * Gets compliance statistics for an employee
 */
export const getEmployeeComplianceStats = async (employeeId: string, fromDate: string, toDate: string) => {
  try {
    const { data: attendance, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', employeeId)
      .gte('date', fromDate)
      .lte('date', toDate);

    if (error) throw error;

    const stats = {
      total_shifts: attendance.length,
      late_count: attendance.filter(a => a.is_late).length,
      early_departure_count: attendance.filter(a => a.is_early_departure).length,
      total_overtime_minutes: attendance.reduce((sum, a) => sum + (a.overtime_minutes || 0), 0),
      pending_overtime_approvals: attendance.filter(a => a.overtime_status === 'pending').length
    };

    return { success: true, stats };
  } catch (error) {
    console.error('Error getting compliance stats:', error);
    return { success: false, error };
  }
};