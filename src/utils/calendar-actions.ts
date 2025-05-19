
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
        last_modified_platform: window.innerWidth < 768 ? 'mobile' : 'desktop'
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
        title: shiftDetails.title
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
        job_title: employeeDetails.job_title
      }
    });
    
    // If shift details are provided, create a shift for the new employee
    if (shiftDetails) {
      await createShiftAssignment(employee.id, {
        title: shiftDetails.title,
        startTime: shiftDetails.startTime,
        endTime: shiftDetails.endTime,
        location: shiftDetails.location
      });
    }
    
    return employee;
  } catch (error) {
    console.error('Error in createEmployeeWithShift:', error);
    throw error;
  }
}
