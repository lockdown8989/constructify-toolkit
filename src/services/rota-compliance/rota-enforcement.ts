import { supabase } from '@/integrations/supabase/client';
import { addDays, subDays, format } from 'date-fns';

export interface RotaComplianceReport {
  totalSchedules: number;
  incompleteSchedules: number;
  complianceRate: number;
  employeesWithViolations: Array<{
    employeeId: string;
    employeeName: string;
    violationCount: number;
  }>;
}

/**
 * Runs the rota pattern compliance check for all employees
 */
export const runRotaComplianceCheck = async (): Promise<RotaComplianceReport> => {
  try {
    console.log('Running rota pattern compliance check...');
    
    // Execute the compliance check function
    const { error: checkError } = await supabase.rpc('check_rota_pattern_compliance');
    
    if (checkError) {
      console.error('Error running compliance check:', checkError);
      throw checkError;
    }

    // Generate compliance report
    const report = await generateComplianceReport();
    
    console.log('Rota compliance check completed:', report);
    return report;
    
  } catch (error) {
    console.error('Failed to run rota compliance check:', error);
    throw error;
  }
};

/**
 * Generates a compliance report for the last 30 days
 */
export const generateComplianceReport = async (): Promise<RotaComplianceReport> => {
  const endDate = new Date();
  const startDate = subDays(endDate, 30);
  
  try {
    // Get all rota schedules from the last 30 days
    const { data: schedules, error: schedulesError } = await supabase
      .from('schedules')
      .select(`
        id,
        employee_id,
        status,
        start_time,
        template_id,
        employees (
          id,
          name
        )
      `)
      .not('template_id', 'is', null) // Only rota pattern schedules
      .in('status', ['confirmed', 'employee_accepted']) // Align with enforcement scope
      .gte('start_time', startDate.toISOString())
      .lte('start_time', endDate.toISOString());

    if (schedulesError) throw schedulesError;

    const totalSchedules = schedules?.length || 0;
    const incompleteSchedules = schedules?.filter(s => s.status === 'incomplete').length || 0;
    const complianceRate = totalSchedules > 0 ? ((totalSchedules - incompleteSchedules) / totalSchedules) * 100 : 100;

    // Calculate employee violations
    const employeeViolations = new Map<string, { name: string; count: number }>();
    
    schedules?.forEach(schedule => {
      if (schedule.status === 'incomplete' && schedule.employees) {
        const employeeId = schedule.employee_id;
        const employeeName = (schedule.employees as any).name;
        
        if (employeeViolations.has(employeeId)) {
          employeeViolations.get(employeeId)!.count += 1;
        } else {
          employeeViolations.set(employeeId, { name: employeeName, count: 1 });
        }
      }
    });

    const employeesWithViolations = Array.from(employeeViolations.entries()).map(([employeeId, data]) => ({
      employeeId,
      employeeName: data.name,
      violationCount: data.count
    }));

    return {
      totalSchedules,
      incompleteSchedules,
      complianceRate: Math.round(complianceRate * 100) / 100,
      employeesWithViolations
    };

  } catch (error) {
    console.error('Failed to generate compliance report:', error);
    throw error;
  }
};

/**
 * Validates if an employee can clock in according to their rota pattern
 */
export const validateClockInCompliance = async (employeeId: string): Promise<{
  canClockIn: boolean;
  message: string;
  rotaShift?: any;
}> => {
  try {
    const today = new Date();
    
    // Get the employee's rota shift for today
    const { data: rotaShift, error } = await supabase.rpc('get_employee_rota_shift_times', {
      p_employee_id: employeeId,
      p_date: format(today, 'yyyy-MM-dd')
    });

    if (error) throw error;

    if (!rotaShift || rotaShift.length === 0) {
      return {
        canClockIn: true,
        message: 'No rota pattern found for today - standard attendance tracking applies'
      };
    }

    const shift = rotaShift[0];
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    const shiftStartTime = shift.start_time;
    const gracePeriod = shift.grace_period_minutes || 15;

    // Calculate grace period window
    const shiftStart = new Date(`${format(today, 'yyyy-MM-dd')}T${shiftStartTime}`);
    const graceStart = new Date(shiftStart.getTime() - (gracePeriod * 60 * 1000));
    const graceEnd = new Date(shiftStart.getTime() + (gracePeriod * 60 * 1000));

    if (now >= graceStart && now <= graceEnd) {
      return {
        canClockIn: true,
        message: `Clocking in for rota shift: ${shift.template_name} (${shiftStartTime})`,
        rotaShift: shift
      };
    } else if (now < graceStart) {
      const minutesUntilGrace = Math.ceil((graceStart.getTime() - now.getTime()) / (60 * 1000));
      return {
        canClockIn: false,
        message: `Too early to clock in. Shift starts at ${shiftStartTime}. You can clock in ${gracePeriod} minutes early (in ${minutesUntilGrace} minutes).`,
        rotaShift: shift
      };
    } else {
      return {
        canClockIn: true,
        message: `Late clock-in for rota shift: ${shift.template_name}. This will be marked as incomplete compliance.`,
        rotaShift: shift
      };
    }

  } catch (error) {
    console.error('Error validating clock-in compliance:', error);
    return {
      canClockIn: true,
      message: 'Unable to verify rota compliance - proceeding with standard clock-in'
    };
  }
};

/**
 * Validates if an employee can clock out according to their rota pattern
 */
export const validateClockOutCompliance = async (employeeId: string): Promise<{
  canClockOut: boolean;
  message: string;
  isOvertime: boolean;
}> => {
  try {
    const today = new Date();
    
    // Get the employee's rota shift for today
    const { data: rotaShift, error } = await supabase.rpc('get_employee_rota_shift_times', {
      p_employee_id: employeeId,
      p_date: format(today, 'yyyy-MM-dd')
    });

    if (error) throw error;

    if (!rotaShift || rotaShift.length === 0) {
      return {
        canClockOut: true,
        message: 'No rota pattern found for today - standard clock-out applies',
        isOvertime: false
      };
    }

    const shift = rotaShift[0];
    const now = new Date();
    const shiftEndTime = shift.end_time;
    const overtimeThreshold = shift.overtime_threshold_minutes || 30;

    // Calculate overtime threshold
    const shiftEnd = new Date(`${format(today, 'yyyy-MM-dd')}T${shiftEndTime}`);
    const overtimeStart = new Date(shiftEnd.getTime() + (overtimeThreshold * 60 * 1000));

    if (now <= shiftEnd) {
      return {
        canClockOut: true,
        message: `Clocking out from rota shift: ${shift.template_name}`,
        isOvertime: false
      };
    } else if (now <= overtimeStart) {
      return {
        canClockOut: true,
        message: `Clocking out after scheduled end time (${shiftEndTime}) but within overtime threshold`,
        isOvertime: false
      };
    } else {
      const overtimeMinutes = Math.ceil((now.getTime() - shiftEnd.getTime()) / (60 * 1000));
      return {
        canClockOut: true,
        message: `Overtime detected: ${overtimeMinutes} minutes beyond scheduled end time. Manager approval may be required.`,
        isOvertime: true
      };
    }

  } catch (error) {
    console.error('Error validating clock-out compliance:', error);
    return {
      canClockOut: true,
      message: 'Unable to verify rota compliance - proceeding with standard clock-out',
      isOvertime: false
    };
  }
};