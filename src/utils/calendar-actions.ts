
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface ShiftData {
  title: string;
  startTime: string;
  endTime: string;
  location?: string;
  notes?: string;
}

/**
 * Creates a shift assignment for a specific employee
 */
export const createShiftAssignment = async (employeeId: string, shiftData: ShiftData) => {
  if (!employeeId) {
    throw new Error("Employee ID is required");
  }

  console.log(`Creating shift assignment for employee ${employeeId}`, shiftData);

  // Create schedule entry first
  const { data: scheduleData, error: scheduleError } = await supabase
    .from('schedules')
    .insert({
      employee_id: employeeId,
      title: shiftData.title,
      start_time: shiftData.startTime,
      end_time: shiftData.endTime,
      location: shiftData.location || null,
      notes: shiftData.notes || null,
      status: 'pending',
      published: true
    })
    .select()
    .single();
  
  if (scheduleError) {
    console.error('Error creating schedule:', scheduleError);
    throw scheduleError;
  }
  
  // Get employee information for notification
  const { data: employee } = await supabase
    .from('employees')
    .select('user_id, name')
    .eq('id', employeeId)
    .maybeSingle();
  
  // Send notification to employee if we have their user_id
  if (employee?.user_id) {
    const startTimeFormat = format(new Date(shiftData.startTime), 'MMM dd, yyyy HH:mm');
    
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: employee.user_id,
        title: 'New Shift Assignment',
        message: `You have been assigned to: ${shiftData.title} starting at ${startTimeFormat}`,
        type: 'info',
        related_entity: 'schedules',
        related_id: scheduleData.id
      });
      
    if (notificationError) {
      console.error('Error sending notification:', notificationError);
      // Don't throw here, as the shift was created successfully
    }
  }
  
  console.log('Shift assignment created successfully:', scheduleData);
  return scheduleData;
};

/**
 * Creates a new employee record and immediately assigns them a shift
 */
export const createEmployeeWithShift = async (employeeData: any, shiftData: ShiftData) => {
  try {
    console.log('Creating employee with shift:', { employeeData, shiftData });
    
    // First create the employee
    const { data: newEmployee, error: employeeError } = await supabase
      .from('employees')
      .insert({
        name: employeeData.name,
        job_title: employeeData.jobTitle || 'Employee',
        department: employeeData.department || 'General',
        site: employeeData.site || 'Main Office',
        salary: employeeData.salary || 0,
        manager_id: employeeData.managerId || null
      })
      .select()
      .single();
    
    if (employeeError) {
      console.error('Error creating employee:', employeeError);
      throw employeeError;
    }
    
    // Then assign the shift to this employee
    const scheduleData = await createShiftAssignment(newEmployee.id, shiftData);
    
    console.log('Employee with shift created successfully:', { employee: newEmployee, schedule: scheduleData });
    
    return {
      employee: newEmployee,
      schedule: scheduleData
    };
  } catch (error) {
    console.error('Error in createEmployeeWithShift:', error);
    throw error;
  }
};

/**
 * Records shift-related actions for analytics
 */
export const recordShiftAction = async (userId: string, actionType: string, details: any) => {
  if (!userId) return;
  
  try {
    console.log(`Recording shift action: ${actionType}`, details);
    
    await supabase
      .from('shift_actions')
      .insert({
        user_id: userId,
        action_type: actionType,
        details,
        created_at: new Date().toISOString()
      });
      
    console.log(`Shift action recorded: ${actionType}`);
  } catch (error) {
    console.error('Failed to record shift action:', error);
  }
};
