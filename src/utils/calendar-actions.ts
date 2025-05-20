import { supabase } from '@/integrations/supabase/client';
import { sendNotification } from '@/services/notifications';
import { format } from 'date-fns';

/**
 * Creates a new shift assignment for a given employee and date
 */
export async function createShiftAssignment(
  employeeId: string,
  shiftDetails: {
    title: string;
    startTime: string | Date;
    endTime: string | Date;
    location?: string;
    notes?: string;
    includeBreak?: boolean;
    breakDuration?: number;
  }
) {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }
    
    // Format dates if they're Date objects
    const startTime = typeof shiftDetails.startTime === 'string' 
      ? shiftDetails.startTime 
      : shiftDetails.startTime.toISOString();
    
    const endTime = typeof shiftDetails.endTime === 'string'
      ? shiftDetails.endTime
      : shiftDetails.endTime.toISOString();
      
    // Insert into schedules table
    const { data, error } = await supabase
      .from('schedules')
      .insert({
        employee_id: employeeId,
        title: shiftDetails.title,
        start_time: startTime,
        end_time: endTime,
        location: shiftDetails.location,
        notes: shiftDetails.notes,
        status: 'pending',
        created_platform: window.innerWidth < 768 ? 'mobile' : 'desktop',
        last_modified_platform: window.innerWidth < 768 ? 'mobile' : 'desktop',
        mobile_friendly_view: {
          font_size: 'medium',
          compact_view: window.innerWidth < 768,
          high_contrast: false
        }
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating shift:', error);
      throw error;
    }
    
    // Log action in calendar_actions table
    await supabase.from('calendar_actions').insert({
      action_type: 'create_shift',
      date: startTime,
      initiator_id: userData.user.id,
      details: {
        shift_id: data.id,
        employee_id: employeeId,
        title: shiftDetails.title,
        include_break: shiftDetails.includeBreak || false,
        break_duration: shiftDetails.breakDuration || 0
      }
    });
    
    // Notify the employee
    const { data: employee } = await supabase
      .from('employees')
      .select('user_id, name')
      .eq('id', employeeId)
      .single();
      
    if (employee?.user_id) {
      const formattedDate = format(new Date(startTime), 'EEEE, MMMM d, yyyy');
      const formattedStartTime = format(new Date(startTime), 'h:mm a');
      const formattedEndTime = format(new Date(endTime), 'h:mm a');
      
      await sendNotification({
        user_id: employee.user_id,
        title: 'New Shift Assigned',
        message: `You have been assigned a new shift "${shiftDetails.title}" on ${formattedDate} from ${formattedStartTime} to ${formattedEndTime}.`,
        type: 'info',
        related_entity: 'schedules',
        related_id: data.id
      });
    }
    
    return data;
  } catch (error) {
    console.error('Error in createShiftAssignment:', error);
    throw error;
  }
}

/**
 * Creates a new employee and assigns initial shifts
 */
export async function createEmployeeWithShift(
  employeeDetails: {
    name: string;
    job_title: string;
    department?: string;
    salary?: number;
    hourly_rate?: number;
  },
  shiftDetails?: {
    title: string;
    startTime: string | Date;
    endTime: string | Date;
    location?: string;
    notes?: string;
    includeBreak?: boolean;
    breakDuration?: number;
  }
) {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }
    
    // Create the employee
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .insert({
        name: employeeDetails.name,
        job_title: employeeDetails.job_title,
        department: employeeDetails.department || 'General',
        salary: employeeDetails.salary || 0,
        hourly_rate: employeeDetails.hourly_rate || 0,
        status: 'Active',
        site: 'Main'
      })
      .select()
      .single();
      
    if (employeeError) {
      console.error('Error creating employee:', employeeError);
      throw employeeError;
    }
    
    // Log the employee creation action
    await supabase.from('calendar_actions').insert({
      action_type: 'create_employee',
      date: new Date().toISOString(),
      initiator_id: userData.user.id,
      details: {
        employee_id: employee.id,
        name: employeeDetails.name,
        job_title: employeeDetails.job_title,
        created_platform: window.innerWidth < 768 ? 'mobile' : 'desktop'
      }
    });
    
    // If shift details are provided, create a shift for the new employee
    if (shiftDetails) {
      await createShiftAssignment(employee.id, {
        title: shiftDetails.title,
        startTime: shiftDetails.startTime,
        endTime: shiftDetails.endTime,
        location: shiftDetails.location,
        notes: shiftDetails.notes,
        includeBreak: shiftDetails.includeBreak,
        breakDuration: shiftDetails.breakDuration
      });
    }
    
    return employee;
  } catch (error) {
    console.error('Error in createEmployeeWithShift:', error);
    throw error;
  }
}

/**
 * Get calendar actions for a specific date range
 */
export async function getCalendarActions(startDate: Date, endDate: Date) {
  try {
    const { data, error } = await supabase
      .from('calendar_actions')
      .select('*')
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString())
      .order('date', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching calendar actions:', error);
    return [];
  }
}

/**
 * Record an action taken by user on calendar
 */
export async function recordCalendarAction(
  actionType: string,
  date: Date | string,
  details: Record<string, any> = {}
) {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return null;
    
    const dateString = typeof date === 'string' ? date : date.toISOString();
    
    const { data, error } = await supabase
      .from('calendar_actions')
      .insert({
        action_type: actionType,
        date: dateString,
        initiator_id: userData.user.id,
        details: {
          ...details,
          platform: window.innerWidth < 768 ? 'mobile' : 'desktop',
          timestamp: Date.now()
        }
      })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error recording calendar action:', error);
    return null;
  }
}

/**
 * Creates a new open shift available for assignment
 */
export async function createOpenShift(
  shiftDetails: {
    title: string;
    startTime: string | Date;
    endTime: string | Date;
    role?: string;
    location?: string;
    notes?: string;
    expirationDate?: string | Date;
  }
) {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }
    
    // Format dates if they're Date objects
    const startTime = typeof shiftDetails.startTime === 'string' 
      ? shiftDetails.startTime 
      : shiftDetails.startTime.toISOString();
    
    const endTime = typeof shiftDetails.endTime === 'string'
      ? shiftDetails.endTime
      : shiftDetails.endTime.toISOString();
    
    const expirationDate = shiftDetails.expirationDate 
      ? (typeof shiftDetails.expirationDate === 'string' 
         ? shiftDetails.expirationDate 
         : shiftDetails.expirationDate.toISOString())
      : undefined;
      
    // Create open shift
    const { data, error } = await supabase
      .from('open_shifts')
      .insert({
        title: shiftDetails.title,
        role: shiftDetails.role || shiftDetails.title,
        start_time: startTime,
        end_time: endTime,
        location: shiftDetails.location,
        notes: shiftDetails.notes,
        expiration_date: expirationDate,
        created_by: userData.user.id,
        status: 'open',
        created_platform: window.innerWidth < 768 ? 'mobile' : 'desktop',
        last_modified_platform: window.innerWidth < 768 ? 'mobile' : 'desktop'
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating open shift:', error);
      throw error;
    }
    
    // Log action in calendar_actions table
    await recordCalendarAction('create_open_shift', startTime, {
      shift_id: data.id,
      title: shiftDetails.title,
      role: shiftDetails.role
    });
    
    return data;
  } catch (error) {
    console.error('Error in createOpenShift:', error);
    throw error;
  }
}

/**
 * Assigns an open shift to an employee
 */
export async function assignOpenShiftToEmployee(
  openShiftId: string,
  employeeId: string
) {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }
    
    // Get open shift data
    const { data: openShift, error: shiftError } = await supabase
      .from('open_shifts')
      .select('*')
      .eq('id', openShiftId)
      .single();
    
    if (shiftError) {
      throw new Error('Open shift not found');
    }
    
    if (openShift.status !== 'open') {
      throw new Error('This shift is no longer available');
    }
    
    // Create assignment record
    const { data: assignment, error: assignError } = await supabase
      .from('open_shift_assignments')
      .insert({
        open_shift_id: openShiftId,
        employee_id: employeeId,
        assigned_by: userData.user.id,
        status: 'confirmed'
      })
      .select()
      .single();
    
    if (assignError) throw assignError;
    
    // Update open shift status to assigned
    const { error: updateError } = await supabase
      .from('open_shifts')
      .update({ 
        status: 'assigned',
        last_modified_platform: window.innerWidth < 768 ? 'mobile' : 'desktop'
      })
      .eq('id', openShiftId);
    
    if (updateError) throw updateError;
    
    // Create schedule entry for the employee - this is what will show in "My Schedule"
    const { data: schedule, error: scheduleError } = await supabase
      .from('schedules')
      .insert({
        employee_id: employeeId,
        title: openShift.title,
        start_time: openShift.start_time,
        end_time: openShift.end_time,
        location: openShift.location,
        notes: openShift.notes,
        status: 'confirmed', // Mark as confirmed so it shows up immediately
        created_platform: window.innerWidth < 768 ? 'mobile' : 'desktop',
        last_modified_platform: window.innerWidth < 768 ? 'mobile' : 'desktop'
      })
      .select()
      .single();
    
    if (scheduleError) throw scheduleError;
    
    // Log the assignment action
    await recordCalendarAction('assign_open_shift', openShift.start_time, {
      shift_id: openShiftId,
      employee_id: employeeId,
      assigned_by: userData.user.id,
      schedule_id: schedule.id
    });
    
    // Notify employee
    const { data: employee } = await supabase
      .from('employees')
      .select('user_id, name')
      .eq('id', employeeId)
      .single();
    
    if (employee?.user_id) {
      await sendNotification({
        user_id: employee.user_id,
        title: 'Shift Assigned',
        message: `You have been assigned a shift: ${openShift.title} on ${format(new Date(openShift.start_time), 'EEEE, MMMM d')} from ${format(new Date(openShift.start_time), 'h:mm a')} to ${format(new Date(openShift.end_time), 'h:mm a')}.`,
        type: 'info',
        related_entity: 'schedules',
        related_id: schedule.id
      });
    }
    
    return {
      assignment,
      schedule
    };
  } catch (error) {
    console.error('Error in assignOpenShiftToEmployee:', error);
    throw error;
  }
}
