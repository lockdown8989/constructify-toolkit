
import { supabase } from '@/integrations/supabase/client';
import { sendNotification } from '@/services/notifications/notification-sender';

export interface RotaShift {
  id: string;
  employee_id: string;
  start_time: string;
  end_time: string;
  title: string;
  notes?: string;
}

/**
 * Automatically confirms rota shifts when employees receive them
 * This ensures shifts are confirmed on their calendar immediately
 */
export const autoConfirmRotaShift = async (scheduleId: string) => {
  try {
    const { data, error } = await supabase
      .from('schedules')
      .update({
        status: 'confirmed',
        published: true,
        published_at: new Date().toISOString(),
        approval_required: false,
        can_be_edited: false
      })
      .eq('id', scheduleId)
      .select('*, employees!inner(*)')
      .single();

    if (error) throw error;

    // Notify employee about the confirmed shift with clock-in/out instructions
    if (data.employees?.user_id) {
      await sendNotification({
        user_id: data.employees.user_id,
        title: '✅ Rota Confirmed - Clock In Required',
        message: `Your shift "${data.title}" on ${new Date(data.start_time).toLocaleDateString()} (${new Date(data.start_time).toLocaleTimeString()} - ${new Date(data.end_time).toLocaleTimeString()}) is now confirmed on your calendar. You must still clock in/out on time. Attendance will be tracked for late arrivals and overtime will require manager approval.`,
        type: 'info',
        related_entity: 'schedules',
        related_id: scheduleId
      });
    }

    console.log('Rota shift auto-confirmed:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error auto-confirming rota shift:', error);
    return { success: false, error };
  }
};

/**
 * Batch approve all pending shifts automatically
 * This will confirm ALL pending shifts (removes title pattern matching)
 */
export const batchApproveAllPendingRotas = async () => {
  try {
    // Get all pending shifts
    const { data: pendingShifts, error: fetchError } = await supabase
      .from('schedules')
      .select('id, employee_id, title, start_time, end_time, employees!inner(user_id, name)')
      .eq('status', 'pending');

    if (fetchError) throw fetchError;

    if (!pendingShifts || pendingShifts.length === 0) {
      return { success: true, message: 'No pending shifts found', count: 0 };
    }

    // Batch update all pending shifts to confirmed
    const { data: updatedShifts, error: updateError } = await supabase
      .from('schedules')
      .update({
        status: 'confirmed',
        published: true,
        published_at: new Date().toISOString(),
        approval_required: false,
        can_be_edited: false
      })
      .eq('status', 'pending')
      .select('id, employee_id, title, start_time, end_time');

    if (updateError) throw updateError;

    // Send notifications to all affected employees
    const notificationPromises = pendingShifts.map(async (shift) => {
      const employee = Array.isArray(shift.employees) ? shift.employees[0] : shift.employees;
      if (employee?.user_id) {
        return sendNotification({
          user_id: employee.user_id,
          title: '✅ Shift Auto-Confirmed - Clock In Required',
          message: `Your shift "${shift.title}" on ${new Date(shift.start_time).toLocaleDateString()} (${new Date(shift.start_time).toLocaleTimeString()} - ${new Date(shift.end_time).toLocaleTimeString()}) has been automatically confirmed. Remember: You must still clock in/out on time. Attendance will be tracked for late arrivals and overtime requires manager approval.`,
          type: 'info',
          related_entity: 'schedules',
          related_id: shift.id
        });
      }
    });

    await Promise.all(notificationPromises);

    console.log(`Batch approved ${updatedShifts?.length || 0} shifts`);
    return { 
      success: true, 
      message: `Successfully auto-confirmed ${updatedShifts?.length || 0} shifts`,
      count: updatedShifts?.length || 0 
    };
  } catch (error) {
    console.error('Error batch approving rota shifts:', error);
    return { success: false, error };
  }
};

/**
 * Creates recurring schedules and auto-confirms them
 */
export const createAndConfirmRecurringRotas = async (params: {
  employeeIds: string[];
  shiftPatternId: string;
  patternName: string;
  startTime: string;
  endTime: string;
  weeksToGenerate: number;
}) => {
  const { employeeIds, shiftPatternId, patternName, startTime, endTime, weeksToGenerate } = params;
  
  try {
    const schedules = [];
    const today = new Date();
    
    for (let week = 0; week < weeksToGenerate; week++) {
      for (let day = 0; day < 7; day++) {
        const scheduleDate = new Date(today);
        scheduleDate.setDate(today.getDate() + (week * 7) + day);
        
        for (const employeeId of employeeIds) {
          const startDateTime = new Date(scheduleDate);
          const [startHour, startMinute] = startTime.split(':');
          startDateTime.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);
          
          const endDateTime = new Date(scheduleDate);
          const [endHour, endMinute] = endTime.split(':');
          endDateTime.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);
          
          schedules.push({
            employee_id: employeeId,
            title: patternName,
            start_time: startDateTime.toISOString(),
            end_time: endDateTime.toISOString(),
            status: 'confirmed',
            published: true,
            published_at: new Date().toISOString(),
            approval_required: false,
            can_be_edited: false,
            shift_type: 'recurring',
            notes: 'Auto-generated rota shift'
          });
        }
      }
    }
    
    const { data, error } = await supabase
      .from('schedules')
      .insert(schedules)
      .select();
    
    if (error) throw error;
    
    // Notify all employees about their new rota schedules
    for (const employeeId of employeeIds) {
      const { data: employee } = await supabase
        .from('employees')
        .select('user_id, name')
        .eq('id', employeeId)
        .single();
        
      if (employee?.user_id) {
        await sendNotification({
          user_id: employee.user_id,
          title: '📅 Rota Schedule Auto-Confirmed',
          message: `Your rota schedule "${patternName}" has been created for the next ${weeksToGenerate} weeks. All shifts are automatically confirmed on your calendar. Important: You must still clock in/out on time for each shift. Attendance will be tracked and any overtime requires manager approval.`,
          type: 'info',
          related_entity: 'schedules',
          related_id: 'rota_batch'
        });
      }
    }
    
    console.log(`Created and confirmed ${schedules.length} rota shifts`);
    return { success: true, data, count: schedules.length };
  } catch (error) {
    console.error('Error creating recurring rotas:', error);
    return { success: false, error };
  }
};
