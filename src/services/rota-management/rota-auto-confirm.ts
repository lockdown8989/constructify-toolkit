
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
 * Automatically confirms rota shifts created by managers
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

    // Notify employee about the confirmed shift
    if (data.employees?.user_id) {
      await sendNotification({
        user_id: data.employees.user_id,
        title: '📅 New Shift Assigned',
        message: `You have been assigned to "${data.title}" on ${new Date(data.start_time).toLocaleDateString()} from ${new Date(data.start_time).toLocaleTimeString()} to ${new Date(data.end_time).toLocaleTimeString()}. Please make sure to clock in and out on time.`,
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
          title: '📅 Rota Schedule Created',
          message: `Your rota schedule "${patternName}" has been created for the next ${weeksToGenerate} weeks. All shifts are automatically confirmed. Please clock in and out on time for each shift.`,
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
