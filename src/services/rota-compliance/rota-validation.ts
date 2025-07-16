// Service for validating rota compliance and ensuring separation from restaurant schedules

import { supabase } from '@/integrations/supabase/client';

export interface RotaComplianceResult {
  is_compliant: boolean;
  message: string;
  scheduled_time: string | null;
  actual_time: string;
  minutes_difference: number;
}

export interface RotaShiftInfo {
  shift_template_id: string;
  template_name: string;
  start_time: string;
  end_time: string;
  break_duration: number;
  grace_period_minutes: number;
  overtime_threshold_minutes: number;
}

/**
 * Get employee's current rota shift information for a specific date
 */
export const getEmployeeRotaShiftTimes = async (
  employeeId: string, 
  date: Date = new Date()
): Promise<RotaShiftInfo | null> => {
  try {
    const { data, error } = await supabase.rpc('get_employee_rota_shift_times', {
      p_employee_id: employeeId,
      p_date: date.toISOString().split('T')[0] // Format as YYYY-MM-DD
    });

    if (error) {
      console.error('Error fetching rota shift times:', error);
      return null;
    }

    return data?.[0] || null;
  } catch (error) {
    console.error('Error in getEmployeeRotaShiftTimes:', error);
    return null;
  }
};

/**
 * Validate employee's clock-in/out against their rota schedule
 */
export const validateRotaCompliance = async (
  employeeId: string,
  actionType: 'clock_in' | 'clock_out',
  actionTime: Date = new Date()
): Promise<RotaComplianceResult | null> => {
  try {
    const { data, error } = await supabase.rpc('validate_rota_compliance', {
      p_employee_id: employeeId,
      p_action_type: actionType,
      p_action_time: actionTime.toISOString()
    });

    if (error) {
      console.error('Error validating rota compliance:', error);
      return null;
    }

    return data?.[0] || null;
  } catch (error) {
    console.error('Error in validateRotaCompliance:', error);
    return null;
  }
};

/**
 * Check if current time is within a rota shift
 */
export const isCurrentlyOnRotaShift = async (employeeId: string): Promise<boolean> => {
  const rotaShift = await getEmployeeRotaShiftTimes(employeeId);
  
  if (!rotaShift) {
    return false; // No rota shift scheduled for today
  }

  const now = new Date();
  const currentTime = now.toTimeString().split(' ')[0]; // Get HH:MM:SS format
  
  // Simple time comparison (assuming same day, not handling midnight crossing)
  return currentTime >= rotaShift.start_time && currentTime <= rotaShift.end_time;
};

/**
 * Get upcoming rota shifts for an employee (next 7 days)
 */
export const getUpcomingRotaShifts = async (employeeId: string): Promise<RotaShiftInfo[]> => {
  const shifts: RotaShiftInfo[] = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    
    const shift = await getEmployeeRotaShiftTimes(employeeId, date);
    if (shift) {
      shifts.push(shift);
    }
  }
  
  return shifts;
};

/**
 * Ensure separation between rota shifts and restaurant schedule single shifts
 * This function checks if there are conflicts between rota and single shifts
 */
export const validateRotaScheduleSeparation = async (
  employeeId: string,
  date: Date
): Promise<{ hasConflict: boolean; conflictDetails?: string }> => {
  try {
    // Get rota shift for the date
    const rotaShift = await getEmployeeRotaShiftTimes(employeeId, date);
    
    if (!rotaShift) {
      return { hasConflict: false }; // No rota shift, no conflict possible
    }

    // Check for restaurant schedule conflicts on the same date
    const dateStr = date.toISOString().split('T')[0];
    const { data: schedules, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('employee_id', employeeId)
      .gte('start_time', `${dateStr}T00:00:00`)
      .lt('start_time', `${dateStr}T23:59:59`)
      .eq('published', true)
      .neq('shift_type', 'rota'); // Exclude rota-generated shifts

    if (error) {
      console.error('Error checking schedule conflicts:', error);
      return { hasConflict: false };
    }

    if (schedules && schedules.length > 0) {
      const conflictingShifts = schedules.map(s => s.title).join(', ');
      return {
        hasConflict: true,
        conflictDetails: `Rota shift conflicts with existing restaurant schedule shifts: ${conflictingShifts}`
      };
    }

    return { hasConflict: false };
  } catch (error) {
    console.error('Error validating rota/schedule separation:', error);
    return { hasConflict: false };
  }
};