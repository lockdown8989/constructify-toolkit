
import { supabase } from '@/integrations/supabase/client';
import { Employee } from '@/types/employee';

export const assignLeavePolicy = async (employee: Employee) => {
  try {
    // If the employee already has leave days set, don't override them
    if (employee.annual_leave_days !== undefined && employee.sick_leave_days !== undefined) {
      return { success: true, message: 'Employee already has leave policy assigned' };
    }
    
    // Default annual and sick leave values
    const annualLeaveDays = 20;  // Default 20 days annual leave
    const sickLeaveDays = 10;    // Default 10 days sick leave
    
    // Update the employee record with default leave values
    const { data, error } = await supabase
      .from('employees')
      .update({
        annual_leave_days: annualLeaveDays,
        sick_leave_days: sickLeaveDays
      })
      .eq('id', employee.id);
      
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error assigning leave policy:', error);
    throw error;
  }
};

// Function to check remaining leave balance
export const checkLeaveBalance = async (employeeId: string) => {
  try {
    // Get employee's leave allocation
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('annual_leave_days, sick_leave_days')
      .eq('id', employeeId)
      .single();
      
    if (employeeError) throw employeeError;
    
    const currentYear = new Date().getFullYear();
    const yearStart = `${currentYear}-01-01`;
    const yearEnd = `${currentYear}-12-31`;
    
    // Get all approved leave for this year
    const { data: approvedLeave, error: leaveError } = await supabase
      .from('leave_calendar')
      .select('type, start_date, end_date')
      .eq('employee_id', employeeId)
      .eq('status', 'Approved')
      .gte('start_date', yearStart)
      .lte('end_date', yearEnd);
      
    if (leaveError) throw leaveError;
    
    // Calculate used leave days
    let annualLeaveUsed = 0;
    let sickLeaveUsed = 0;
    
    approvedLeave?.forEach(leave => {
      const startDate = new Date(leave.start_date);
      const endDate = new Date(leave.end_date);
      const daysDiff = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24) + 1;
      
      if (leave.type === 'Annual') {
        annualLeaveUsed += daysDiff;
      } else if (leave.type === 'Sick') {
        sickLeaveUsed += daysDiff;
      }
    });
    
    // Calculate remaining leave
    const annualLeaveRemaining = (employee?.annual_leave_days || 0) - annualLeaveUsed;
    const sickLeaveRemaining = (employee?.sick_leave_days || 0) - sickLeaveUsed;
    
    return {
      success: true,
      annual: {
        total: employee?.annual_leave_days || 0,
        used: annualLeaveUsed,
        remaining: annualLeaveRemaining
      },
      sick: {
        total: employee?.sick_leave_days || 0,
        used: sickLeaveUsed,
        remaining: sickLeaveRemaining
      }
    };
  } catch (error) {
    console.error('Error checking leave balance:', error);
    throw error;
  }
};

// Function to process a leave request
export const processLeaveRequest = async (
  employeeId: string, 
  startDate: string, 
  endDate: string, 
  leaveType: string,
  notes?: string
) => {
  try {
    // Check leave balance first
    const leaveBalance = await checkLeaveBalance(employeeId);
    
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const daysDiff = (endDateObj.getTime() - startDateObj.getTime()) / (1000 * 3600 * 24) + 1;
    
    let hasEnoughBalance = true;
    
    if (leaveType === 'Annual' && leaveBalance.annual.remaining < daysDiff) {
      hasEnoughBalance = false;
    } else if (leaveType === 'Sick' && leaveBalance.sick.remaining < daysDiff) {
      hasEnoughBalance = false;
    }
    
    if (!hasEnoughBalance) {
      return {
        success: false,
        message: `Not enough ${leaveType.toLowerCase()} leave balance. Requested: ${daysDiff}, Remaining: ${
          leaveType === 'Annual' ? leaveBalance.annual.remaining : leaveBalance.sick.remaining
        }`
      };
    }
    
    // Check for scheduling conflicts
    const { data: scheduleConflicts } = await supabase
      .from('schedules')
      .select('id, start_time, end_time')
      .eq('employee_id', employeeId)
      .gte('start_time', startDate)
      .lte('end_time', endDate);
    
    // Create the leave request
    const { data: leaveRequest, error } = await supabase
      .from('leave_calendar')
      .insert({
        employee_id: employeeId,
        start_date: startDate,
        end_date: endDate,
        type: leaveType,
        status: 'Pending',
        notes: notes || '',
        audit_log: JSON.stringify([{
          timestamp: new Date().toISOString(),
          action: 'Created',
          status: 'Pending'
        }])
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return {
      success: true,
      leaveRequest,
      hasScheduleConflicts: scheduleConflicts && scheduleConflicts.length > 0,
      scheduleConflicts
    };
  } catch (error) {
    console.error('Error processing leave request:', error);
    throw error;
  }
};
