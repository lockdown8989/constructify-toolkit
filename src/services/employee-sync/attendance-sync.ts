import { supabase } from '@/integrations/supabase/client';
import { Employee } from '@/types/employee';

export const initializeAttendance = async (employee: Employee) => {
  try {
    // Create placeholder record for today
    const today = new Date();
    
    const { data, error } = await supabase
      .from('attendance')
      .insert({
        employee_id: employee.id,
        date: today.toISOString().split('T')[0],
        attendance_status: 'Pending',
        active_session: false
      });
      
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error initializing attendance:', error);
    throw error;
  }
};

// Function to record employee clock in
export const recordClockIn = async (employeeId: string, deviceInfo?: string, location?: string) => {
  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    console.log('Recording clock in at (local):', now.toLocaleString());
    console.log('Recording clock in at (ISO):', now.toISOString());
    
    // Check if there's already a record for today
    const { data: existingRecord } = await supabase
      .from('attendance')
      .select('id, check_in')
      .eq('employee_id', employeeId)
      .eq('date', today)
      .single();
    
    if (existingRecord) {
      // Update existing record with ISO string time
      const { data, error } = await supabase
        .from('attendance')
        .update({
          check_in: now.toISOString(), // Use ISO string to preserve timezone
          device_info: deviceInfo,
          location: location,
          active_session: true,
          attendance_status: 'Present'
        })
        .eq('id', existingRecord.id);
        
      if (error) throw error;
      
      return { success: true, record: data };
    } else {
      // Create new record with ISO string time
      const { data, error } = await supabase
        .from('attendance')
        .insert({
          employee_id: employeeId,
          date: today,
          check_in: now.toISOString(), // Use ISO string to preserve timezone
          device_info: deviceInfo,
          location: location,
          active_session: true,
          attendance_status: 'Present'
        })
        .select()
        .single();
        
      if (error) throw error;
      
      return { success: true, record: data };
    }
  } catch (error) {
    console.error('Error recording clock in:', error);
    throw error;
  }
};

// Function to record employee clock out
export const recordClockOut = async (employeeId: string) => {
  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    console.log('Recording clock out at (local):', now.toLocaleString());
    console.log('Recording clock out at (ISO):', now.toISOString());
    
    // Find the active session for today
    const { data: activeSession } = await supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('date', today)
      .eq('active_session', true)
      .single();
      
    if (activeSession) {
      // Calculate working minutes using exact timestamps
      const checkInTime = new Date(activeSession.check_in);
      console.log('Check-in time from DB:', activeSession.check_in);
      console.log('Parsed check-in time:', checkInTime.toLocaleString());
      
      const workingMinutes = Math.round((now.getTime() - checkInTime.getTime()) / (1000 * 60));
      
      // Calculate overtime (if more than 8 hours / 480 minutes)
      const overtimeMinutes = Math.max(0, workingMinutes - 480);
      const regularMinutes = workingMinutes - overtimeMinutes;
      
      console.log('Working minutes calculated:', workingMinutes);
      console.log('Regular minutes:', regularMinutes);
      console.log('Overtime minutes:', overtimeMinutes);
      
      const { data, error } = await supabase
        .from('attendance')
        .update({
          check_out: now.toISOString(), // Use ISO string to preserve timezone
          active_session: false,
          working_minutes: regularMinutes,
          overtime_minutes: overtimeMinutes
        })
        .eq('id', activeSession.id);
        
      if (error) throw error;
      
      return { success: true, record: data };
    } else {
      throw new Error('No active session found for today');
    }
  } catch (error) {
    console.error('Error recording clock out:', error);
    throw error;
  }
};

// Function to check if employee is on approved leave
export const checkIfOnApprovedLeave = async (employeeId: string, date: string) => {
  try {
    const { data: leaveRequests, error } = await supabase
      .from('leave_calendar')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('status', 'Approved')
      .lte('start_date', date)
      .gte('end_date', date);
      
    if (error) throw error;
    
    return {
      onLeave: leaveRequests && leaveRequests.length > 0,
      leaveRequest: leaveRequests && leaveRequests.length > 0 ? leaveRequests[0] : null
    };
  } catch (error) {
    console.error('Error checking if employee is on leave:', error);
    throw error;
  }
};

// Function to mark employee as absent for scheduled shifts
export const markAbsenceForMissedShifts = async () => {
  try {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    // Find all scheduled shifts for yesterday
    const { data: yesterdayShifts } = await supabase
      .from('schedules')
      .select('id, employee_id, start_time, end_time')
      .gte('start_time', `${yesterdayStr}T00:00:00`)
      .lte('end_time', `${yesterdayStr}T23:59:59`);
      
    if (!yesterdayShifts || yesterdayShifts.length === 0) return;
    
    // For each shift, check if attendance was recorded
    for (const shift of yesterdayShifts) {
      const { data: attendanceRecord } = await supabase
        .from('attendance')
        .select('id, attendance_status')
        .eq('employee_id', shift.employee_id)
        .eq('date', yesterdayStr)
        .single();
        
      if (!attendanceRecord) {
        // No attendance record exists, create one with 'Absent' status
        
        // First, check if employee was on leave
        const { onLeave } = await checkIfOnApprovedLeave(shift.employee_id, yesterdayStr);
        
        await supabase
          .from('attendance')
          .insert({
            employee_id: shift.employee_id,
            date: yesterdayStr,
            attendance_status: onLeave ? 'On Leave' : 'Absent',
            active_session: false
          });
      } else if (attendanceRecord.attendance_status === 'Pending') {
        // Attendance record exists but is 'Pending', check if employee was on leave
        const { onLeave } = await checkIfOnApprovedLeave(shift.employee_id, yesterdayStr);
        
        await supabase
          .from('attendance')
          .update({
            attendance_status: onLeave ? 'On Leave' : 'Absent'
          })
          .eq('id', attendanceRecord.id);
      }
    }
  } catch (error) {
    console.error('Error marking absences:', error);
    throw error;
  }
};

// Function to record employee clock in with GPS
export const recordClockInWithGPS = async (
  employeeId: string, 
  deviceInfo?: string, 
  location?: string,
  gpsLatitude?: number,
  gpsLongitude?: number,
  gpsAccuracy?: number
) => {
  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    console.log('Recording clock in with GPS at (local):', now.toLocaleString());
    console.log('GPS coordinates:', { gpsLatitude, gpsLongitude, gpsAccuracy });
    
    // Check if there's already a record for today
    const { data: existingRecord } = await supabase
      .from('attendance')
      .select('id, check_in')
      .eq('employee_id', employeeId)
      .eq('date', today)
      .single();
    
    const attendanceData = {
      check_in: now.toISOString(),
      device_info: deviceInfo,
      location: location,
      active_session: true,
      attendance_status: 'Present' as const,
      gps_latitude: gpsLatitude,
      gps_longitude: gpsLongitude,
      gps_accuracy: gpsAccuracy
    };
    
    if (existingRecord) {
      // Update existing record
      const { data, error } = await supabase
        .from('attendance')
        .update(attendanceData)
        .eq('id', existingRecord.id)
        .select()
        .single();
        
      if (error) throw error;
      
      return { success: true, record: data };
    } else {
      // Create new record
      const { data, error } = await supabase
        .from('attendance')
        .insert({
          employee_id: employeeId,
          date: today,
          ...attendanceData
        })
        .select()
        .single();
        
      if (error) throw error;
      
      return { success: true, record: data };
    }
  } catch (error) {
    console.error('Error recording clock in with GPS:', error);
    throw error;
  }
};
