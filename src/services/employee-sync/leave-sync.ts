
import { supabase } from '@/integrations/supabase/client';
import { Employee } from '@/types/employee';
import { sendNotification } from '../notifications/notification-sender';

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

// Function to check for conflicts with existing shifts
const checkShiftConflicts = async (employeeId: string, startDate: string, endDate: string) => {
  try {
    // Convert dates to ISO format
    const start = new Date(startDate).toISOString();
    const end = new Date(endDate).toISOString();
    
    // Find shifts that overlap with the leave period
    const { data: conflictingShifts, error } = await supabase
      .from('schedules')
      .select('id, start_time, end_time, title')
      .eq('employee_id', employeeId)
      .or(`start_time.gte.${start},end_time.lte.${end}`);
      
    if (error) throw error;
    
    return {
      hasConflicts: conflictingShifts && conflictingShifts.length > 0,
      shifts: conflictingShifts || []
    };
  } catch (error) {
    console.error('Error checking shift conflicts:', error);
    throw error;
  }
};

// Function to check for existing attendance records
const checkAttendanceRecords = async (employeeId: string, startDate: string, endDate: string) => {
  try {
    // Convert dates to correct format for comparison
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Get all dates between start and end
    const dates = [];
    const currentDate = new Date(start);
    while (currentDate <= end) {
      dates.push(new Date(currentDate).toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Check for existing attendance records
    const { data: existingRecords, error } = await supabase
      .from('attendance')
      .select('date, attendance_status')
      .eq('employee_id', employeeId)
      .in('date', dates);
      
    if (error) throw error;
    
    return {
      hasRecords: existingRecords && existingRecords.length > 0,
      records: existingRecords || []
    };
  } catch (error) {
    console.error('Error checking attendance records:', error);
    throw error;
  }
};

// Function to notify managers about new leave request
const notifyManagersAboutLeave = async (
  employeeId: string,
  leaveRequest: any,
  conflicts: { shifts: any[], attendanceRecords: any[] }
) => {
  try {
    // Get employee details
    const { data: employee } = await supabase
      .from('employees')
      .select('name, manager_id')
      .eq('id', employeeId)
      .single();
    
    if (!employee) return;
    
    // Get manager's user ID
    let managerUserId = null;
    if (employee.manager_id) {
      const { data: manager } = await supabase
        .from('employees')
        .select('user_id')
        .eq('id', employee.manager_id)
        .single();
        
      if (manager) {
        managerUserId = manager.user_id;
      }
    }
    
    // If no direct manager found, notify all managers
    if (!managerUserId) {
      const managerIds = await import('../notifications/notification-sender').then(module => 
        module.getManagerUserIds()
      );
      
      for (const id of managerIds) {
        await sendNotification({
          user_id: id,
          title: 'New Leave Request',
          message: `${employee.name} has requested ${leaveRequest.type} leave from ${leaveRequest.start_date} to ${leaveRequest.end_date}`,
          type: 'info',
          related_entity: 'leave_calendar',
          related_id: leaveRequest.id
        });
        
        if (conflicts.shifts.length > 0) {
          await sendNotification({
            user_id: id,
            title: 'Leave Request Has Shift Conflicts',
            message: `This leave request conflicts with ${conflicts.shifts.length} existing shifts for ${employee.name}`,
            type: 'warning',
            related_entity: 'leave_calendar',
            related_id: leaveRequest.id
          });
        }
      }
    } else {
      // Notify specific manager
      await sendNotification({
        user_id: managerUserId,
        title: 'New Leave Request',
        message: `${employee.name} has requested ${leaveRequest.type} leave from ${leaveRequest.start_date} to ${leaveRequest.end_date}`,
        type: 'info',
        related_entity: 'leave_calendar',
        related_id: leaveRequest.id
      });
      
      if (conflicts.shifts.length > 0) {
        await sendNotification({
          user_id: managerUserId,
          title: 'Leave Request Has Shift Conflicts',
          message: `This leave request conflicts with ${conflicts.shifts.length} existing shifts for ${employee.name}`,
          type: 'warning',
          related_entity: 'leave_calendar',
          related_id: leaveRequest.id
        });
      }
    }
  } catch (error) {
    console.error('Error notifying managers about leave:', error);
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
    const { hasConflicts, shifts } = await checkShiftConflicts(employeeId, startDate, endDate);
    
    // Check for existing attendance records
    const { hasRecords, records } = await checkAttendanceRecords(employeeId, startDate, endDate);
    
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
    
    // Notify managers about the leave request including conflict information
    await notifyManagersAboutLeave(employeeId, leaveRequest, {
      shifts,
      attendanceRecords: records
    });
    
    return {
      success: true,
      leaveRequest,
      hasScheduleConflicts: hasConflicts,
      scheduleConflicts: shifts,
      hasAttendanceRecords: hasRecords,
      attendanceRecords: records
    };
  } catch (error) {
    console.error('Error processing leave request:', error);
    throw error;
  }
};

// Function to handle approved leave
export const handleApprovedLeave = async (leaveId: string) => {
  try {
    // Get leave details
    const { data: leave, error } = await supabase
      .from('leave_calendar')
      .select('*, employees(user_id, name)')
      .eq('id', leaveId)
      .single();
      
    if (error) throw error;
    
    // Update attendance records for the leave period
    const startDate = new Date(leave.start_date);
    const endDate = new Date(leave.end_date);
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Check if there's an existing attendance record for this date
      const { data: existingRecord } = await supabase
        .from('attendance')
        .select('id')
        .eq('employee_id', leave.employee_id)
        .eq('date', dateStr)
        .single();
        
      if (existingRecord) {
        // Update existing record
        await supabase
          .from('attendance')
          .update({
            attendance_status: 'On Leave'
          })
          .eq('id', existingRecord.id);
      } else {
        // Create new record
        await supabase
          .from('attendance')
          .insert({
            employee_id: leave.employee_id,
            date: dateStr,
            attendance_status: 'On Leave',
            active_session: false,
            notes: `Automatically marked as leave (${leave.type})`
          });
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Handle conflicting shifts
    const start = new Date(leave.start_date).toISOString();
    const end = new Date(leave.end_date).toISOString();
    
    const { data: conflictingShifts } = await supabase
      .from('schedules')
      .select('id, start_time, end_time, title')
      .eq('employee_id', leave.employee_id)
      .or(`start_time.gte.${start},end_time.lte.${end}`);
      
    if (conflictingShifts && conflictingShifts.length > 0) {
      // Update shifts to reflect the leave
      await supabase
        .from('schedules')
        .update({
          status: 'rejected', // or other appropriate status
          notes: `Automatically cancelled due to approved ${leave.type} leave`
        })
        .in('id', conflictingShifts.map(shift => shift.id));
        
      // Notify managers about the cancelled shifts
      const managerIds = await import('../notifications/notification-sender').then(module => 
        module.getManagerUserIds()
      );
      
      for (const id of managerIds) {
        await sendNotification({
          user_id: id,
          title: 'Shifts Cancelled Due to Leave',
          message: `${leave.employees.name}'s approved leave has resulted in ${conflictingShifts.length} cancelled shifts`,
          type: 'warning',
          related_entity: 'schedules'
        });
      }
    }
    
    // Notify employee about approved leave
    if (leave.employees.user_id) {
      await sendNotification({
        user_id: leave.employees.user_id,
        title: 'Leave Approved',
        message: `Your ${leave.type} leave request from ${leave.start_date} to ${leave.end_date} has been approved`,
        type: 'success',
        related_entity: 'leave_calendar',
        related_id: leaveId
      });
    }
    
    // If unpaid leave, calculate salary deduction
    if (leave.type === 'Unpaid') {
      // Get employee's salary details
      const { data: employee } = await supabase
        .from('employees')
        .select('salary')
        .eq('id', leave.employee_id)
        .single();
      
      if (employee) {
        const daysDiff = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24) + 1;
        const dailyRate = employee.salary / 22; // Assuming 22 working days in a month
        const deduction = dailyRate * daysDiff;
        
        // Update salary record for the current month
        const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
        
        await supabase
          .from('salary_statistics')
          .update({
            deductions: supabase.rpc('increment', { x: deduction }),
            notes: `Unpaid leave deduction added: ${deduction.toFixed(2)}`
          })
          .eq('employee_id', leave.employee_id)
          .eq('month', currentMonth);
      }
    }
    
    return { success: true, shiftsAffected: conflictingShifts?.length || 0 };
  } catch (error) {
    console.error('Error handling approved leave:', error);
    throw error;
  }
};
