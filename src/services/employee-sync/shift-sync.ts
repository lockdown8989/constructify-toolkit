
import { supabase } from '@/integrations/supabase/client';
import { Employee } from '@/types/employee';
import { sendNotification } from '@/services/notifications/notification-sender';

export const createDefaultShift = async (employee: Employee) => {
  try {
    // Get default shift templates for the employee's department
    const { data: templates } = await supabase
      .from('schedule_templates')
      .select('*')
      .eq('role', employee.job_title)
      .limit(1);
    
    const defaultTemplate = templates?.[0];
    
    // If no template found, create a standard 9-5 weekday schedule
    const startTime = defaultTemplate?.start_time || '09:00:00';
    const endTime = defaultTemplate?.end_time || '17:00:00';
    const daysOfWeek = defaultTemplate?.days_of_week || [1, 2, 3, 4, 5]; // Monday to Friday
    
    // Create shifts for next two weeks
    const today = new Date();
    const twoWeeksLater = new Date(today);
    twoWeeksLater.setDate(today.getDate() + 14);
    
    const shifts = [];
    
    // Loop through each day in the next two weeks
    for (let i = 0; i < 14; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);
      
      // Check if this day of week should have a shift
      if (daysOfWeek.includes(currentDate.getDay())) {
        const startDateTime = new Date(currentDate);
        const [hours, minutes] = startTime.split(':').map(Number);
        startDateTime.setHours(hours, minutes, 0, 0);
        
        const endDateTime = new Date(currentDate);
        const [endHours, endMinutes] = endTime.split(':').map(Number);
        endDateTime.setHours(endHours, endMinutes, 0, 0);
        
        shifts.push({
          employee_id: employee.id,
          title: employee.job_title,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          status: 'confirmed',
          created_at: new Date().toISOString(),
          created_platform: 'system',
          last_modified_platform: 'system',
          published: true
        });
      }
    }
    
    // Insert shifts into database
    if (shifts.length > 0) {
      const { data, error } = await supabase
        .from('schedules')
        .insert(shifts);
        
      if (error) throw error;
      
      // Notify employee about new shifts if they have a user account
      if (employee.user_id) {
        await sendNotification({
          user_id: employee.user_id,
          title: 'Default Schedule Created',
          message: `Your default work schedule has been created with ${shifts.length} shifts over the next two weeks.`,
          type: 'info',
          related_entity: 'schedules'
        });
      }
    }
    
    return { success: true, shiftsCreated: shifts.length };
  } catch (error) {
    console.error('Error creating default shifts:', error);
    throw error;
  }
};

// Function to update shift rules when employee role changes
export const updateShiftRules = async (employeeId: string, newRole: string) => {
  try {
    // Get template for the new role
    const { data: template } = await supabase
      .from('schedule_templates')
      .select('*')
      .eq('role', newRole)
      .limit(1);
    
    if (!template || template.length === 0) {
      return { success: true, message: 'No template found for new role' };
    }
    
    // Get future shifts
    const now = new Date().toISOString();
    const { data: futureShifts, error } = await supabase
      .from('schedules')
      .select('id, start_time, end_time')
      .eq('employee_id', employeeId)
      .gt('start_time', now)
      .order('start_time', { ascending: true });
      
    if (error) throw error;
    
    // Update future shifts based on new template
    // For simplicity, we're just updating the title/role here
    if (futureShifts && futureShifts.length > 0) {
      // In a more complete implementation, you might adjust shift times based on new template
      const { error: updateError } = await supabase
        .from('schedules')
        .update({
          title: newRole,
          last_modified_platform: 'system'
        })
        .in('id', futureShifts.map(shift => shift.id));
        
      if (updateError) throw updateError;
    }
    
    // Get the employee's user ID for notification
    const { data: employee } = await supabase
      .from('employees')
      .select('user_id')
      .eq('id', employeeId)
      .single();
    
    if (employee?.user_id) {
      await sendNotification({
        user_id: employee.user_id,
        title: 'Schedule Updated',
        message: `Your schedule has been updated to reflect your new role: ${newRole}`,
        type: 'info',
        related_entity: 'schedules'
      });
    }
    
    return { success: true, shiftsUpdated: futureShifts?.length || 0 };
  } catch (error) {
    console.error('Error updating shift rules:', error);
    throw error;
  }
};

// Function to check for leave conflicts when scheduling a shift
export const checkLeaveConflicts = async (employeeId: string, startTime: string, endTime: string) => {
  try {
    // Check if there's approved leave during this period
    const { data: leaveRequests, error } = await supabase
      .from('leave_calendar')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('status', 'Approved')
      .lte('start_date', new Date(endTime).toISOString().split('T')[0])
      .gte('end_date', new Date(startTime).toISOString().split('T')[0]);
      
    if (error) throw error;
    
    return {
      hasConflict: leaveRequests && leaveRequests.length > 0,
      leaveRequests: leaveRequests || []
    };
  } catch (error) {
    console.error('Error checking leave conflicts:', error);
    throw error;
  }
};

// Function to notify employee about new shift
export const notifyEmployeeAboutShift = async (employeeId: string, shift: any) => {
  try {
    // Get employee details
    const { data: employee, error } = await supabase
      .from('employees')
      .select('user_id, name')
      .eq('id', employeeId)
      .single();
      
    if (error || !employee || !employee.user_id) return;
    
    // Format shift time for better readability
    const startDate = new Date(shift.start_time);
    const formattedDate = startDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long', 
      day: 'numeric'
    });
    
    const startTime = startDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const endTime = new Date(shift.end_time).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    await sendNotification({
      user_id: employee.user_id,
      title: 'New Shift Scheduled',
      message: `You have been scheduled for a shift on ${formattedDate} from ${startTime} to ${endTime}.`,
      type: 'info',
      related_entity: 'schedules',
      related_id: shift.id
    });
    
    // Auto-generate daily tasks/reminders for the shift
    await generateShiftTasks(shift, employee.user_id);
    
  } catch (error) {
    console.error('Error notifying employee about shift:', error);
  }
};

// Function to generate tasks/reminders for a shift
export const generateShiftTasks = async (shift: any, userId: string) => {
  try {
    // Generate tasks based on shift information
    const startTime = new Date(shift.start_time);
    const reminders = [
      {
        title: 'Shift Reminder',
        message: `Remember your shift starts tomorrow at ${startTime.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        })}`,
        remind_at: new Date(startTime.getTime() - 24 * 60 * 60 * 1000).toISOString(), // 1 day before
        user_id: userId,
        related_entity: 'schedules',
        related_id: shift.id,
        status: 'pending'
      },
      {
        title: 'Upcoming Shift',
        message: `Your shift starts in 1 hour`,
        remind_at: new Date(startTime.getTime() - 60 * 60 * 1000).toISOString(), // 1 hour before
        user_id: userId,
        related_entity: 'schedules',
        related_id: shift.id,
        status: 'pending'
      }
    ];
    
    // Insert reminders into database (this table would need to be created in the real system)
    for (const reminder of reminders) {
      try {
        await sendNotification({
          user_id: userId,
          title: reminder.title,
          message: reminder.message,
          type: 'info',
          related_entity: 'schedules',
          related_id: shift.id
        });
      } catch (innerError) {
        console.error('Error creating reminder:', innerError);
      }
    }
    
    return { success: true, remindersCreated: reminders.length };
  } catch (error) {
    console.error('Error generating shift tasks:', error);
    return { success: false, error: String(error) };
  }
};

// Function to handle a new shift being added to the calendar
export const handleNewShift = async (shift: any) => {
  try {
    const employeeId = shift.employee_id;
    
    // 1. Check for leave conflicts
    const { hasConflict, leaveRequests } = await checkLeaveConflicts(
      employeeId,
      shift.start_time,
      shift.end_time
    );
    
    // 2. Notify employee about the shift
    await notifyEmployeeAboutShift(employeeId, shift);
    
    // 3. Return information about conflicts
    return {
      success: true,
      hasLeaveConflict: hasConflict,
      leaveRequests: leaveRequests
    };
  } catch (error) {
    console.error('Error handling new shift:', error);
    throw error;
  }
};
