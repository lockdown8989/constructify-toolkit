import { supabase } from '@/integrations/supabase/client';

/**
 * Create attendance record when a new shift is scheduled
 * @param employeeId Employee ID
 * @param date Shift date
 * @param startTime Shift start time
 * @param endTime Shift end time
 */
export const createAttendanceFromShift = async (
  employeeId: string,
  date: string,
  startTime: string,
  endTime: string
) => {
  try {
    // Check if there's already an attendance record for this employee on this date
    const { data: existingRecord, error: checkError } = await supabase
      .from('attendance')
      .select('id')
      .eq('employee_id', employeeId)
      .eq('date', date)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing attendance:', checkError);
      throw checkError;
    }

    // If record exists, update it
    if (existingRecord) {
      const { data, error } = await supabase
        .from('attendance')
        .update({
          status: 'Scheduled',
          attendance_status: 'Pending',
          expected_time_in: startTime,
          expected_time_out: endTime
        })
        .eq('id', existingRecord.id)
        .select();

      if (error) throw error;
      return { success: true, data, updated: true };
    } 
    // Otherwise create new record
    else {
      const { data, error } = await supabase
        .from('attendance')
        .insert({
          employee_id: employeeId,
          date: date,
          status: 'Scheduled',
          attendance_status: 'Pending',
          expected_time_in: startTime,
          expected_time_out: endTime,
          active_session: false
        })
        .select();

      if (error) throw error;
      return { success: true, data, updated: false };
    }
  } catch (error) {
    console.error('Error creating attendance record from shift:', error);
    return { success: false, error };
  }
};

/**
 * Update attendance records when leave request is approved
 * @param employeeId Employee ID
 * @param leaveStartDate Leave start date
 * @param leaveEndDate Leave end date
 * @param leaveType Type of leave (paid, unpaid, etc.)
 */
export const updateAttendanceForLeave = async (
  employeeId: string,
  leaveStartDate: string,
  leaveEndDate: string,
  leaveType: string
) => {
  try {
    // Get all dates between start and end date (inclusive)
    const startDate = new Date(leaveStartDate);
    const endDate = new Date(leaveEndDate);
    const leaveDates = [];
    
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      leaveDates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    const updates = [];
    
    // Update attendance records for each day of leave
    for (const date of leaveDates) {
      // Check if attendance record exists
      const { data: existingRecord } = await supabase
        .from('attendance')
        .select('id')
        .eq('employee_id', employeeId)
        .eq('date', date)
        .maybeSingle();
      
      // Update existing record
      if (existingRecord) {
        const { data, error } = await supabase
          .from('attendance')
          .update({
            status: 'On Leave',
            attendance_status: leaveType.toLowerCase().includes('unpaid') ? 'Absent' : 'On Leave',
            active_session: false,
            notes: `On approved ${leaveType} leave`
          })
          .eq('id', existingRecord.id);
          
        if (error) throw error;
        updates.push({ date, updated: true });
      } 
      // Create new attendance record
      else {
        const { data, error } = await supabase
          .from('attendance')
          .insert({
            employee_id: employeeId,
            date: date,
            status: 'On Leave',
            attendance_status: leaveType.toLowerCase().includes('unpaid') ? 'Absent' : 'On Leave',
            active_session: false,
            notes: `On approved ${leaveType} leave`
          });
          
        if (error) throw error;
        updates.push({ date, updated: false });
      }
      
      // Remove any scheduled shifts for this day
      const { error: deleteError } = await supabase
        .from('schedules')
        .delete()
        .eq('employee_id', employeeId)
        .eq('date', date);
        
      if (deleteError) {
        console.error(`Error removing shift for ${date}:`, deleteError);
      }
    }
    
    return { success: true, updates };
  } catch (error) {
    console.error('Error updating attendance for leave:', error);
    return { success: false, error };
  }
};
